
const u = require("wlj-utilities");

module.exports = getServer;

function getServer() {
    let result;
    u.scope(getServer.name, x => {
        result = 'https://us-central1-flow-pl.cloudfunctions.net/'
    });
    return result;
}
