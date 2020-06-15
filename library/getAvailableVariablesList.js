
const u = require("wlj-utilities");
const getAvailableVariables = require("./getAvailableVariables");

module.exports = getAvailableVariablesList;

function getAvailableVariablesList(type) {
    let result;
    u.scope(getAvailableVariablesList.name, x => {
        let availableVariables = getAvailableVariables();
        u.merge(x, {availableVariables});
        result = availableVariables
            .filter(v => v.type.$type === 'typeList');
        u.merge(x, {result});
    });
    return result;
}
