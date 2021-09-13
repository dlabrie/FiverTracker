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
            "x-device-total-memory": "",
            "x-device-serial-number":"",
            "x-device-name": "",
            "x-device-has-notch": "false",
            "user-agent": userAgent(),
            "x-device-locale": "en-CA",
            "x-device-manufacturer": "Unknown",
            "x-device-is-tablet": "false",
            "x-device-total-disk-capacity": "",
            "x-device-system-name": "FiverTracker",
            "x-device-carrier": "",
            "x-device-model": "",
            "x-device-id": "",
            "x-device-country": "CA",
            "x-device-mac-address": "02:00:00:00:00:00",
            "accept-language": "en-ca",
            "x-device-ip-address": "10.100.100.11",
            "x-device-unique-id": uuid.toUpperCase(),
            "content-type": "application/json",
            "accept": "application/json",
            "x-device-brand": "",
            "x-device-system-version": "0.8.69",
        },
        "body": JSON.stringify({"strategy":"local","username":username,"password":password}),
        "method": "POST",
        "credentials": "include"
    });
    return AuthResponse;
};

export default loginStepOne;