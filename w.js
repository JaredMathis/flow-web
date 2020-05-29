const dl = require('./library/downloadFromServer');
const ul = require('./library/uploadToServer');
const uploadLibrary = require('./library/uploadLibrary');
const sb = require('./library/sandbox');

let commandLine = require('wlj-utilities').commandLine;
commandLine({
    dl,
    ul,
    sb,
    uploadLibrary,
});