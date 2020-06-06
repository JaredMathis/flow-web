
const u = require("wlj-utilities");
const getState = require("./getState");

module.exports = getEditFlow;

function getEditFlow() {
    let result;
    u.scope(getEditFlow.name, x => {
        result = getState().flows[getState().editFlowIndex];
    });
    return result;
}
