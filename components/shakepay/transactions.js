import {userAgent} from './userAgent';

const transactions = async (uuid, authToken, mode, timestamp) => {
    var endpoint = "https://api.shakepay.com/transactions/history";
    if(authToken=="demo")
        endpoint = "https://swap.labrie.ca/shakepay/transactions/history/"

    var path;
    if(mode=="before")
        path = endpoint+"?limit=2000&currency=CAD&before="+timestamp
    else
        path = endpoint+"?limit=2000&currency=CAD&since="+timestamp

    return await fetch(path, {
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
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
};

export default transactions;