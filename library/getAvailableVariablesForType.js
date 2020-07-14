
const u = require("wlj-utilities");
const getAvailableVariables = require("./getAvailableVariables");

module.exports = getAvailableVariablesForType;

let log = false;

function getAvailableVariablesForType(type) {
    let result;
    u.scope(getAvailableVariablesForType.name, x => {
        let availableVariables = getAvailableVariables();
        u.merge(x, {availableVariables});
        result = availableVariables
            .filter(v => {
                let a = type;
                let b = v.type;
                if (log) console.log({a,b});
                if (a.$type === 'typeList') {
                    return a.$type === b.$type
                        && a.nested.$type === b.nested.$type;
                }
                return a.$type === b.$type;
            });
        u.merge(x, {result});
        if (log) console.log({availableVariables,type,result})
    });
    return result;
}
