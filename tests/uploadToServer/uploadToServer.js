
const u = require("wlj-utilities");

const uploadToServer = require("../../library/uploadToServer.js");
const dl = require("../../library/dl.js");

u.scope(__filename, x => {
    let ref = 'uploadToServerTest';
    let timestamp = new Date().getTime() + "";
    uploadToServer(ref, timestamp);
    let actual = dl(ref);
    u.merge(x,{actual});
    u.assert(() => actual === timestamp);
});
