
const u = require("wlj-utilities");

const getAvailableVariables = require("./getAvailableVariables");

module.exports = directiveEditFlowSet;

function directiveEditFlowSet() {
    let result;
    u.scope(directiveEditFlowSet.name, x => {
        result = {
            scope: {
                statement: '=',
            },
            link: function (scope, element, attrs) {
                scope.getAvailableVariables = getAvailableVariables;
            },
            template: `
            Set
            <div>
                <select 
                    class="custom-select"
                    ng-model="test"
                    ng-options="v.name as v.name for v in getAvailableVariables()">
                </select>   
            </div>
            `
        };
    });
    return result;
}
