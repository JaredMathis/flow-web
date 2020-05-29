
const u = require("wlj-utilities");
const request = require("sync-request");

const server = require("./getServer")();

// TODO: Rename this more to something more descriptive
module.exports = downloadFromServer;

function downloadFromServer(refs) {
    let result;
    u.scope(downloadFromServer.name, x => {
        let log = false;
        let wrapped = false;
        if (!u.isArray(refs)) {
            wrapped = true;
            refs = [refs];
        }
        u.assertIsStringArray(refs);
        let response = request('GET', `${server}/download?refs=${refs.join(",")}`);
        let json = response.body.toString();
        let body = JSON.parse(json)
        if (!body.success || log) console.log(downloadFromServer.name + ": " + json);
        u.assert(() => body.success === true);
        u.assert(() => u.isDefined(body.values));
        result = body.values;
        let keys = Object.keys(result);
        u.merge(x,{keys});
        for (let key of keys) {
            u.assert(() => u.isString(result[key]));
        }
        if (wrapped) {
            u.assert(() => keys.length === 1);
            result = result[keys[0]];
        }
    });
    return result;
}
