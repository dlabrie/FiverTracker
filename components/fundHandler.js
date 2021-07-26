import wallet from "./shakepay/wallet"
import sendToShaketag from "./shakepay/sendToShaketag"

export const sendFunds = async (uuid, authToken, shaketag, amount, note) => {
    var walletResponse = await wallet(uuid, authToken);
    var w = await walletResponse.json();
    if(walletResponse.status != 200) {
        alert("An error happened when fetching the wallet. Please try again");
        return false;
    }

    for(let i in w.data) {
        if(w.data[i].currency == "CAD") {
            var walletId = w.data[i].id;
            break;
        }
    }

    var fundResponse = await sendToShaketag(uuid, authToken, shaketag, walletId, amount, note);
    var fr = await fundResponse.json();

    if(fundResponse.status != 201) {
        alert("An error happened when sending $"+amount+" to "+shaketag+". Please try again. DEBUG: "+fundResponse.status+" "+JSON.stringify(fr));
        return false;
    }

    return true;
}