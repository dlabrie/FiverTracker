import {userAgent} from './userAgent';

const wallet = async (uuid, authToken) => {
    var endpoint = "https://api.shakepay.com/wallets";
    if(authToken=="demo")
        endpoint = "https://swap.labrie.ca/shakepay/wallets/"

    var results = await fetch(endpoint, {
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
    return results;
}

export default wallet;