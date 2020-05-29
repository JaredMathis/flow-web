
const u = require("wlj-utilities");

const uploadToServer = require("../../library/uploadToServer.js");
const dl = require("../../library/downloadFromServer.js");

u.scope(__filename, x => {
    singleUploadDownload();
    multipleUploadDownload();
});

function multipleUploadDownload() {
    u.scope(singleUploadDownload.name, x => {
        let ref1 = 'uploadToServerTest1';
        let ref2 = 'uploadToServerTest2';
        let timestamp1 = new Date().getTime() + "1";
        let timestamp2 = new Date().getTime() + "2";
        let values = [ {ref: ref1, data: timestamp1 }, {ref: ref2, data: timestamp2 } ];
        uploadToServer(values);
        let actual = dl([ref1, ref2]);
        u.merge(x,{actual});
        u.assert(() => actual[ref1] === timestamp1);
        u.assert(() => actual[ref2] === timestamp2);
    });
}

function singleUploadDownload() {
    u.scope(singleUploadDownload.name, x => {
        let ref = 'uploadToServerTest';
        let timestamp = new Date().getTime() + "";
        uploadToServer({ref, data: timestamp });
        let actual = dl(ref);
        u.merge(x,{actual});
        u.assert(() => actual === timestamp);
    });
}