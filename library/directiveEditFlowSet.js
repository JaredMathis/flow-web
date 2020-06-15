
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
                scope.variable = () => {
                    scope.type = 'variable';
                };
                scope.variable = () => {
                    scope.type = 'value';
                };
                if (scope.statement.right.$type === 'newInt') {
                    scope.type = 'value';
                }
            },
            template: `
            Set
            <div>
            <button class="btn"
                ng-class="{ 'btn-primary': type=='variable', 'btn-secondary':type!='variable' }"
                ng-click="variable()">
                Variable
            </button>
            <button class="btn"
            ng-class="{ 'btn-primary': type=='value', 'btn-secondary':type!='value' }"
                ng-click="value()">
                Value
            </button>
            <select 
                class="custom-select"
                ng-model="statement.left"
                ng-options="v.name as v.name for v in getAvailableVariables()">
            </select>
            </div>
            <div ng-show="type == 'value'">
            <input 
                class="form-control" 
                ng-model="statement.right.value" />
            </div>
            </div>
            <div ng-show="type == 'variable'">
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
