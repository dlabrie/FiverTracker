import {userAgent} from '../shakepay/userAgent';

const lookupLabrie = async (uuid, shaketag, step) => {
    endpoint = "https://swap.labrie.ca/api/";

    var lookup = await fetch(endpoint, {
        "headers": {
            "accept": "application/json",
            "Content-Type": "application/json",
            "user-agent": userAgent(),
        },
        "body": JSON.stringify({"source":uuid.toUpperCase(),"shaketag":shaketag,"step":step}),
        "method": "POST",
        "credentials": "include"
    });
    return lookup;
};

export default lookupLabrie;