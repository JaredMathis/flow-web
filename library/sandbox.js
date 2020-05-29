
const u = require("wlj-utilities");
const flow = require("wlj-flow");
const library = flow.getLibrary();

const downloadFromServer = require('./downloadFromServer')

module.exports = sandbox;

function sandbox() {
    let result;
    u.scope(sandbox.name, x => {
        let libraryNames = library.map(f => "flow/" + f.name);
        let downloaded = downloadFromServer(libraryNames);
        console.log({downloaded});
    });
    return result;
}
