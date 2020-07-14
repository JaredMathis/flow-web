
const u = require("wlj-utilities");
const getAvailableVariablesForType = require("./getAvailableVariablesForType");

module.exports = directiveEditFlowBlock;

function directiveEditFlowBlock() {
    let result;
    u.scope(directiveEditFlowBlock.name, x => {
        result = {
            scope: {
                statement: '=',
            },
            link: function (scope, element, attrs) {

                scope.getAvailableVariablesForType = getAvailableVariablesForType;
            },
            template: `
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text">If</span>
                </div>
                <select 
                    class="custom-select"
                    ng-model="statement.condition"
                    ng-options="v.name as v.name for v in getAvailableVariablesForType({$type:'typeBool'})">
                </select>
            </div>
            <edit-flow-statement
                statement="statement.ifStatement">
            </edit-flow-statement>
            Else
            <edit-flow-statement
                statement="statement.elseStatement">
            </edit-flow-statement>
            `
        };
    });
    return result;
}
