import {userAgent} from './userAgent';
import {wallet} from './wallet'

const sendToShaketag = async (uuid, authToken, shaketag, wallet, amount, note) => {
    var endpoint = "https://api.shakepay.com/transactions";
    if(authToken=="demo")
        endpoint = "https://swap.labrie.ca/shakepay/transactions/"

    return await fetch(endpoint, {
        "headers": {
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9,fr;q=0.8",
            "content-type": "application/json",
            "user-agent": userAgent(),
            "authorization": authToken,
            "x-device-mac-address": "02:00:00:00:00:00",
            "x-device-ip-address": "10.69.4.20",
            "x-device-unique-id": uuid.toUpperCase(),
        },
        "referrerPolicy": "same-origin",
        "body":JSON.stringify({amount: amount.toString(), fromWallet: wallet, note: note, to: shaketag, toType: "user"}),
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });
};

export default sendToShaketag;