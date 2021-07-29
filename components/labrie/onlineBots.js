import {userAgent} from '../shakepay/userAgent';

const onlineBots = async () => {
    endpoint = "https://swap.labrie.ca/api/online-bots/";

    var lookup = await fetch(endpoint, {
        "headers": {
            "accept": "application/json",
            "Content-Type": "application/json",
            "user-agent": userAgent(),
        },
        "method": "GET",
        "credentials": "include"
    });
    return lookup;
};

export default onlineBots;