
const u = require("wlj-utilities");
const request = require("sync-request");

const server = require("./getServer")();

module.exports = uploadToServer;

function uploadToServer(ref, data) {
    let result;
    u.scope(uploadToServer.name, x => {
        u.assert(() => u.isString(ref));
        u.assert(() => u.isString(data));
        let log = true;
        let result = request('POST', server + "/upload", {
            json: {
                ref,
                data,
            }
        });
        let json = result.body.toString();
        if (log) console.log(uploadToServer.name + ": " + json);
        let body = JSON.parse(json)
        u.assert(() => body.success === true);
    });
    return result;
}
