
const u = require("wlj-utilities");
const request = require("sync-request");

const server = require("./getServer")();

// TODO: Rename this more to something more descriptive
module.exports = dl;

function dl(ref) {
    let result;
    u.scope(dl.name, x => {
        u.assert(() => u.isString(ref));
        let log = true;
        let response = request('GET', `${server}/download?ref=${ref}`);
        let json = response.body.toString();
        if (log) console.log(dl.name + ": " + json);
        let body = JSON.parse(json)
        u.assert(() => body.success === true);
        u.assert(() => u.isString(body.value));
        result = body.value;
    });
    return result;
}
