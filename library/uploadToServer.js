
const u = require("wlj-utilities");
const request = require("sync-request");

const server = require("./getServer")();

module.exports = uploadToServer;

function uploadToServer(values) {
    let result;
    u.scope(uploadToServer.name, x => {
        if (!u.isArray(values)) {
            values = [values];
        }
        u.loop(values, value => {
            u.assert(() => u.isString(value.ref));
            u.assert(() => u.isString(value.value));
        })
        let log = false;
        let result = request('POST', server + "/upload", {
            json: {
                values,
            }
        });
        let json = result.body.toString();
        let body = JSON.parse(json)
        if (log || !body.success) console.log(uploadToServer.name + ": " + json);
        u.assert(() => body.success === true);
    });
    return result;
}
