import {userAgent} from '../shakepay/userAgent';

const stats = async (metadata) => {
    endpoint = "https://swap.labrie.ca/api/leaderboard/";
    var lookup = await fetch(endpoint, {
        "headers": {
            "accept": "application/json",
            "Content-Type": "application/json",
            "user-agent": userAgent(),
        },
        "body": JSON.stringify(metadata),
        "method": "POST",
        "credentials": "include"
    });
    return lookup;
};

export default stats;