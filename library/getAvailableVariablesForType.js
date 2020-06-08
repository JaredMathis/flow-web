
const u = require("wlj-utilities");
const getAvailableVariables = require("./getAvailableVariables");

module.exports = getAvailableVariablesForType;

function getAvailableVariablesForType(type) {
    let result;
    u.scope(getAvailableVariablesForType.name, x => {
        let availableVariables = getAvailableVariables();
        u.merge(x, {availableVariables});
        result = availableVariables
            .filter(v => JSON.stringify(v.type) === JSON.stringify(type));
        u.merge(x, {result});
    });
    return result;
}
