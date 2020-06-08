
const u = require("wlj-utilities");
const getEditFlow = require("./getEditFlow");
const flow = require("wlj-flow");

module.exports = getAvailableVariables;

function getAvailableVariables() {
    let result;
    u.scope(getAvailableVariables.name, x => {
        const ef = getEditFlow();
        u.merge(x,{ef});
        result = flow.getAvailableVariables(ef);
        u.merge(x,{result});
    });
    return result;
}
