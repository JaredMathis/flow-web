const dl = require('./library/downloadFromServer');
const ul = require('./library/uploadToServer');

let commandLine = require('wlj-utilities').commandLine;
commandLine({
    dl,
    ul,
});