const dl = require('./library/downloadFromServer');
const ul = require('./library/uploadToServer');
const uploadLibrary = require('./library/uploadLibrary');

let commandLine = require('wlj-utilities').commandLine;
commandLine({
    dl,
    ul,
    uploadLibrary,
});