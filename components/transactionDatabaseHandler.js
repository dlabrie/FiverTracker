import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('transactions.db') // returns Database object

import transactions from './shakepay/transactions'

export const init = async () => {
    db.transaction(tx => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS transactions (transactionId TEXT PRIMARY KEY, createdAt TEXT, currency TEXT, amount REAL, peer TEXT, note TEXT)', [])
        tx.executeSql('CREATE TABLE IF NOT EXISTS peers (peerId TEXT PRIMARY KEY, peerLabel TEXT)', [])
    });
}

export const updateTransactions = (uuid, authToken, transactionDispatch) => {
    db.transaction(tx => {
        tx.executeSql('SELECT transactionId, createdAt FROM transactions ORDER BY createdAt DESC', null, 
            (txObj, { rows: { _array } }) => getTransactions(uuid, authToken, _array, transactionDispatch)
        )
    });
}

var insertedRows = 0;
var peersToUpdate = 0;
var peersToUpdateCompleted = 0;

var updatePeersFromTransactionsCallbackReady = false;
var getTransactionsRunning = false;
export const getTransactions = async (uuid, authToken, data, transactionDispatch) => {
    if(getTransactionsRunning) {
        return false;
    }
    getTransactionsRunning = true;

    var mode, timestamp;
    var existingTransactions = {};
    if(data.length==0) {
        mode = "before";
        timestamp = new Date().toISOString();
    } else {
        var transactionCount = data.length;
        for(let i in data) {
            existingTransactions[data[i].transactionId] = 1;
        }

        mode = "since"
        timestamp = data[0].createdAt;
    }
    
    insertedRows = 0;
    peersToUpdate = 0;
    peersToUpdateCompleted = 0;
    updatePeersFromTransactionsCallbackReady = false;
    
    var dispatchedTransactions = 0;
    var transactionsToDispatch = [];
    var allTransactions = [];

    var pullMore = true;
    while (pullMore === true) {
        transactionDispatch({ type: "loadingStatus", loadingComplete: false, loadingState: `Loading transactions ${mode} ${timestamp}\n\nWaiting on API`});

        var transactionsResponse = await transactions(uuid, authToken, mode, timestamp);

        if(transactionsResponse.status != "200") {
            pullMore = false;
            break;
        }

        var transactionsJson = await transactionsResponse.json();

        for (var i = 0; i < transactionsJson.length; i++) {
            var t = transactionsJson[i];

            if (t.type != "peer") continue;

            var createdAt = parseInt(Date.parse(t.createdAt));
            if (createdAt < 1618963200000) { //april 20 at night
                // we hit april 20
                pullMore = false;
                transactionDispatch({ type: "loadingStatus", loadingComplete: true, loadingState: null});
                break;
            }

            timestamp = t.createdAt;

            if(typeof existingTransactions[t.transactionId] === 'undefined') {
                transactionsToDispatch.push(t);
                allTransactions.push(t);
            }
            existingTransactions[t.transactionId] = 1;

            if(transactionsToDispatch.length >= 1000) {
                addTransactions(transactionsToDispatch);
                dispatchedTransactions += transactionsToDispatch.length;
                transactionsToDispatch = [];
            }
        }

        transactionCount += transactionsJson.length;
        if(transactionsJson.length < 2000) {
            pullMore = false;
        }
    }

    if(transactionsToDispatch.length > 0) {
        addTransactions(transactionsToDispatch);
        dispatchedTransactions += transactionsToDispatch.length;
        transactionsToDispatch = [];
    }

    while (insertedRows != dispatchedTransactions) {
        transactionDispatch({ type: "loadingStatus", loadingComplete: false, loadingState: insertedRows+"/"+dispatchedTransactions+" transactions have been saved."});
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    updatePeersFromTransactions(allTransactions);
    while (updatePeersFromTransactionsCallbackReady == false || peersToUpdateCompleted != peersToUpdate) {
        if(peersToUpdate != 0)
            transactionDispatch({ type: "loadingStatus", loadingComplete: false, loadingState: peersToUpdateCompleted+"/"+peersToUpdate+" peers have been updated/added."});
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    getPeers(transactionDispatch);

    transactionDispatch({ type: "loadingStatus", loadingComplete: false, loadingState: "Processing balances."});
    await processBalances(transactionDispatch);

    transactionDispatch({ type: "loadingStatus", loadingComplete: true, loadingState: null});
    getTransactionsRunning = false;
}

export const addTransactions = async(ts) => {
    // Make sure it doesn't exist first
    db.transaction(tx => {
        for(let iad in ts) {
            var t = ts[iad];
            var frmid = (t.direction=="credit"?t.from.id:t.to.id);

            var transactionValues = [
                t.transactionId, 
                t.createdAt,
                t.currency,
                (t.direction=="credit"?t.amount:t.amount*-1), 
                frmid,
                t.note,
            ];

            tx.executeSql('INSERT INTO transactions (transactionId, createdAt, currency, amount, peer, note) VALUES (?,?,?,?,?,?)', transactionValues,
                () => { insertedRows++; },
            );
        }
    });
}

export const updatePeersFromTransactions = async(ts) => {
    db.transaction(tx => {
        tx.executeSql('SELECT peerId, peerLabel FROM peers', null, 
            (txObj, { rows: { _array } }) => updatePeersFromTransactionsCallback(_array, ts)
        );
    });
}

export const updatePeersFromTransactionsCallback = async(data, ts) => {
    var actions = [];
    var peers = [];
    for(let iupftc in ts) {
        var t = ts[iupftc];
        var frmid = (t.direction=="credit"?t.from.id:t.to.id);
        var frmusr = (t.direction=="credit"?t.from.label:t.to.label).replace("@","");

        if(typeof peers[frmid] !== 'undefined')
            continue;
        peers[frmid] =1;

        var found = false;
        for(let k in data) {
            var d = data[k];
            if(d.peerId == frmid) {
                found = true;
                if(d.peerLabel != frmusr) {
                    actions.push({type: "update", frmid:frmid, frmusr:frmusr});
                    peersToUpdate++;
                }
                break;
            }
        }
        if(!found) {
            actions.push({type: "insert", frmid:frmid, frmusr:frmusr});
            peersToUpdate++;
        }
    }

    updatePeersFromTransactionsCallbackReady = true;

    db.transaction(tx => {
        for(let l in actions) {
            if(actions[l].type == "insert") {
                tx.executeSql('INSERT INTO peers (peerId, peerLabel) VALUES (?,?)', [actions[l].frmid, actions[l].frmusr], () => { peersToUpdateCompleted++; });
            } else {
                tx.executeSql('UPDATE peers SET peerLabel = ? WHERE peerId = ?', [actions[l].frmusr, actions[l].frmid], () => { peersToUpdateCompleted++; });
            }
        }
    });
}


export const resetTransactions = async () => {
    db.transaction(tx => {
        tx.executeSql('DELETE FROM transactions', []);
        tx.executeSql('DELETE FROM peers', []);
    });
}

export const getPeers = async (transactionDispatch) => {
    db.transaction(tx => {
        tx.executeSql('SELECT peerId, peerLabel FROM peers', null, 
            (txObj, { rows: { _array } }) => getPeersCallback(_array, transactionDispatch)
        );
    });
}

export const getPeersCallback = async(data, transactionDispatch) => {
    if(data.length>0) {
        var peers = {};
        var peersInverse = {};
        for(let ipcb in data) {
            peers[data[ipcb].peerId] = data[ipcb].peerLabel;
            peersInverse[data[ipcb].peerLabel] = data[ipcb].peerId;
        }
        transactionDispatch({type: 'storePeers', peers: peers, peersInverse: peersInverse});
    }
}

export const processBalances = async (transactionDispatch) => {
    db.transaction(tx => {
        tx.executeSql('SELECT * FROM transactions ORDER BY createdAt DESC', null, 
            (txObj, { rows: { _array } }) => processBalancesCallback(_array, transactionDispatch)
        )
    });
}

export const processBalancesCallback = async (data, transactionDispatch) => {
    var swapperBalance = {};
    var swapperTransactions = {};

    var todaysSwappers = {};

    var localTime = new Date();
    var localTimeOffset = localTime.getTimezoneOffset();
    var msOffset = (localTimeOffset - 240) * 60 * 1000;
    var easternTime = new Date(localTime.getTime() + msOffset);
    var midnightStart = new Date(easternTime.getFullYear(), easternTime.getMonth(), easternTime.getDate(), 0, 0, 0, 0);
    var startTime = new Date(midnightStart.getTime() - msOffset);

    for(let ipbc in data) {
        var t = data[ipbc];
        var swapper_id = t.peer;

        if (parseInt(Date.parse(t.createdAt)) > startTime.getTime()) {
            todaysSwappers[swapper_id] = 1;
        }
        if (typeof swapperBalance[swapper_id] === 'undefined') {
            swapperBalance[swapper_id] = 0;
        }
        if (typeof swapperTransactions[swapper_id] === 'undefined') {
            swapperTransactions[swapper_id] = [];
        }
        swapperBalance[swapper_id] = swapperBalance[swapper_id] + t.amount;
        swapperTransactions[swapper_id].push(t);
    }

    var owing = [];
    var owes = [];
        
    for(let isb in swapperBalance) {
        var roundedDues = swapperBalance[isb].toFixed(2);
        if(swapperBalance[isb] > 0.50) {
            owing.push({amount: roundedDues, lastTransaction: swapperTransactions[isb][0]});
        }
        if(swapperBalance[isb] < -0.50) {
            owes.push({amount: roundedDues, lastTransaction: swapperTransactions[isb][0]});
        }
    }

    transactionDispatch({type: "todaysSwappers", todaysSwappers: todaysSwappers});
    transactionDispatch({type: "dues", owes: owes, owing: owing});
}

export const getUserTransactions = async (shaketag, transactionDispatch) => {
    db.transaction(tx => {
        tx.executeSql('SELECT peerId, peerLabel FROM peers WHERE peerLabel = ?', [shaketag], 
            (txObj, { rows: { _array } }) => getUserTransactionsCallback(_array, transactionDispatch)
        );
    });
}

export const getUserTransactionsCallback = async(data, transactionDispatch) => {
    if(data.length>0) {
        db.transaction(tx => {
            tx.executeSql('SELECT * FROM transactions WHERE peer = ?', [data[0].peerId], 
                (txObj, { rows: { _array } }) => transactionDispatch({type: 'userTransactions', history: _array})
            );
        });
    } else {
        transactionDispatch({type: 'userTransactions', history: []});
    }
}

export const getHistory = async (transactionDispatch) => {
    db.transaction(tx => {
        tx.executeSql('SELECT * FROM transactions ORDER BY createdAt DESC LIMIT 1000', null, 
            (txObj, { rows: { _array } }) => {
                transactionDispatch({type: 'userTransactions', history: _array})
            }
        )
    });
}