export default function isAuthenticated(jsonResponse: any) {
    if(typeof jsonResponse === 'undefined')
        return true;
    if(typeof jsonResponse.code === 'undefined') 
        return true;
    if(jsonResponse.code == "401" && jsonResponse.className == "not-authenticated")
        return false;
    
    return true;
}