import {userAgent} from './userAgent';

const loginStepOne = async (uuid, username, password) => {
    var AuthResponse = await fetch("https://api.shakepay.com/authentication", {
        "headers": {
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9,fr;q=0.8",
            "content-type": "application/json",
            "User-Agent": userAgent(),
            "X-Device-Mac-Address": "02:00:00:00:00:00",
            "X-Device-Ip-Address": "10.69.4.20",
            "X-Device-Unique-Id": uuid.toUpperCase(),
        },
        "referrerPolicy": "same-origin",
        "body": JSON.stringify({"strategy":"local","username":username,"password":password}),
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });
    return AuthResponse;
};

export default loginStepOne;