
const u = require("wlj-utilities");

module.exports = getState;

const state = {};

function getState() {
    let result;
    u.scope(getState.name, x => {
        result = state;
    });
    return result;
}
