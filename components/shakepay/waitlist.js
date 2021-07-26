import {userAgent} from './userAgent';

const waitlist = async (uuid, authToken) => {
    var endpoint = "https://api.shakepay.com/card/waitlist";
    if(authToken=="demo")
        endpoint = "https://swap.labrie.ca/shakepay/card/waitlist/"

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
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
};

export default waitlist;