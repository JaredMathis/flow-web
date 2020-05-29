
const u = require("wlj-utilities");
const flow = require("wlj-flow");
const library = flow.getLibrary();
const uploadToServer = require("./uploadToServer");

module.exports = uploadLibrary;

function uploadLibrary() {
    let result;
    u.scope(uploadLibrary.name, x => {
        u.assert(() => u.isDefined(library));
        u.loop(library, fn => {
            u.assert(() => u.isString(fn.name));
        });

        let values = library.map(fn => {
            return {
                ref: 'flow/' + fn.name,
                value: JSON.stringify(fn),
            }
        });

        uploadToServer(values);
    });
    return result;
}
