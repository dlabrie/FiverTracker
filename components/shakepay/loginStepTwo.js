
import {userAgent} from './userAgent';  

const loginStepTwo = async (uuid, authToken, mfa) => {
    var AuthResponse = await fetch("https://api.shakepay.com/authentication", {
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
        "body": JSON.stringify({"strategy":"mfa","mfaToken":mfa}),
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });
    return AuthResponse;
};

export default loginStepTwo;