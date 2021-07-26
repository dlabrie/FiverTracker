import {userAgent} from './userAgent';

const loginStepOne = async (uuid, username, password) => {
    var endpoint = "https://api.shakepay.com/authentication";
    if(username=="demo")
        endpoint = "https://swap.labrie.ca/shakepay/authentication/";

    var AuthResponse = await fetch(endpoint, {
        "headers": {
            "accept": "application/json",
            "Content-Type": "application/json",
            "user-agent": userAgent(),
            "X-Device-Mac-Address": "02:00:00:00:00:00",
            "X-Device-Ip-Address": "10.69.4.20",
            "X-Device-Unique-Id": uuid.toUpperCase(),
        },
        "body": JSON.stringify({"strategy":"local","username":username,"password":password}),
        "method": "POST",
        "credentials": "include"
    });
    return AuthResponse;
};

export default loginStepOne;