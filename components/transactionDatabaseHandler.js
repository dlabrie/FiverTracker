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
export const getTransactions = async (uuid, authToken, data, transactionDispatch) => {
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
    var dispatchedTransactions = 0;

    var pullMore = true;
    while (pullMore === true) {
        transactionDispatch({ type: "loadingStatus", loadingMode: mode, loadingDate: timestamp, loadingComplete: false, loadingState: "Waiting on API"});

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
                transactionDispatch({ type: "loadingStatus", loadingMode: null, loadingDate: null, loadingComplete: true, loadingState: null});
                break;
            }

            timestamp = t.createdAt;

            if(typeof existingTransactions[t.transactionId] === 'undefined') {
                await addTransaction(t);
                dispatchedTransactions++;
            }

            existingTransactions[t.transactionId] = 1 ;
        }

        transactionCount += transactionsJson.length;

        if(transactionsJson.length < 2000) {
            pullMore = false;
        }
    }

    processBalances(transactionDispatch);
    getPeers(transactionDispatch);

    while (insertedRows != dispatchedTransactions) {
        transactionDispatch({ type: "loadingStatus", loadingMode: mode, loadingDate: timestamp, loadingComplete: false, loadingState: insertedRows+"/"+dispatchedTransactions+" transactions have been saved."});
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    transactionDispatch({ type: "loadingStatus", loadingMode: null, loadingDate: null, loadingComplete: true, loadingState: null});

}

export const addTransaction = async(t, transactionDispatch) => {
    var frmid = (t.direction=="credit"?t.from.id:t.to.id);
    var frmusr = (t.direction=="credit"?t.from.label:t.to.label).replace("@","");

    var transaction = [
        t.transactionId, 
        t.createdAt,
        t.currency,
        (t.direction=="credit"?t.amount:t.amount*-1), 
        frmid,
        t.note,
    ];

    // Make sure it doesn't exist first
    db.transaction(tx => {
        tx.executeSql('INSERT INTO transactions (transactionId, createdAt, currency, amount, peer, note) VALUES (?,?,?,?,?,?)', transaction,
            () => { insertedRows++; },
        );
    });

    // Update the label for the user
    db.transaction(tx => {
        tx.executeSql('SELECT peerId, peerLabel FROM peers WHERE peerid = ?', [ frmid ], 
            (txObj, { rows: { _array } }) => updatePeerCallback(frmid, frmusr, _array)
        );
    });
    
}

export const resetTransactions = async () => {
    db.transaction(tx => {
        tx.executeSql('DELETE FROM transactions', []);
    });
}

export const updatePeerCallback = async(frmid, frmusr, data) => {
    if(data.length==0) {
        // Make sure it doesn't exist first
        db.transaction(tx => {
            tx.executeSql('INSERT INTO peers (peerId, peerLabel) VALUES (?,?)', [frmid, frmusr]);
        });
    } else {
        // Make sure it doesn't exist first
        db.transaction(tx => {
            tx.executeSql('UPDATE peers SET peerLabel = ? WHERE peerId = ?', [frmusr, frmid]);
        });
    }
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
        for(let i in data) {
            peers[data[i].peerId] = data[i].peerLabel;
            peersInverse[data[i].peerLabel] = data[i].peerId;
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
    var swapperBalance = {}
    var swapperTransactions = {}

    for(let i in data) {
        var t = data[i];
        var swapper_id = t.peer;

        if (typeof swapperBalance[swapper_id] === 'undefined') {
            //if (typeof swapperBalanceInit[swapper_usr] === 'undefined') {
                swapperBalance[swapper_id] = 0;
            //} else {
            //    swapperBalance[swapper_id] = swapperBalanceInit[swapper_usr];
            //}
        }
        if (typeof swapperTransactions[swapper_id] === 'undefined') {
            swapperTransactions[swapper_id] = [];
        }
        swapperBalance[swapper_id] = swapperBalance[swapper_id] + t.amount;
        swapperTransactions[swapper_id].push(t);
    }

    var owing = [];
    var owes = [];
        
    for(let i in swapperBalance) {
        var roundedDues = swapperBalance[i].toFixed(2);
        if(swapperBalance[i] > 0.50) {
            owing.push({amount: roundedDues, lastTransaction: swapperTransactions[i][0]});
        }
        if(swapperBalance[i] < -0.50) {
            owes.push({amount: roundedDues, lastTransaction: swapperTransactions[i][0]});
        }
    }

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
                (txObj, { rows: { _array } }) => getUserTransactionsCallbackData(_array, transactionDispatch)
            );
        });
    } else {
        transactionDispatch({type: 'userTransactions', history: []});
    }
}

export const getUserTransactionsCallbackData = async(data, transactionDispatch) => {
    if(data.length>0) {
        transactionDispatch({type: 'userTransactions', history: data});
    }
}


export const getHistory = async (transactionDispatch) => {
    db.transaction(tx => {
        tx.executeSql('SELECT * FROM transactions ORDER BY createdAt DESC LIMIT 1000', null, 
            (txObj, { rows: { _array } }) => getHistoryCallback(_array, transactionDispatch)
        )
    });
}

export const getHistoryCallback = async(data, transactionDispatch) => {
    if(data.length>0) {
        transactionDispatch({type: 'userTransactions', history: data});
    }
}
