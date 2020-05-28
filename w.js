const dl = require('./library/dl');
const ul = require('./library/uploadToServer');

let commandLine = require('wlj-utilities').commandLine;
commandLine({
    dl,
    ul,
});