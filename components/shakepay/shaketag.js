import jwt_decode, { JwtHeader } from "jwt-decode";
import {userAgent} from './userAgent';

const shaketag = async (uuid, authToken) => {
    if(authToken=="demo") 
        return "demo";

    jwt = jwt_decode(authToken);
    var endpoint = "https://api.shakepay.com/users/"+jwt["userId"];
    
    var request = await fetch(endpoint, {
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
    result = await request.json();
    if(request.status != 200) {
        return "";
    }
    return result["username"];
};

export default shaketag;