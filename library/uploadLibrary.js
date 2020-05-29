
const u = require("wlj-utilities");
const flow = require("wlj-flow");
const library = flow.getLibrary();

module.exports = uploadLibrary;

function uploadLibrary() {
    let result;
    u.scope(uploadLibrary.name, x => {
        u.assert(() => u.isDefined(libary));
        u.loop(library, fn => {
            u.assert(() => u.isString(fn.name));
        });

        let values = library.map(fn => {
            return {
                ref: fn.name,
                //data: 
            }
        })
    });
    return result;
}
