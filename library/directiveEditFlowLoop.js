
const u = require("wlj-utilities");
const getAvailableVariablesList = require("./getAvailableVariablesList");

module.exports = directiveEditFlowLoop;

function directiveEditFlowLoop() {
    let result;
    u.scope(directiveEditFlowLoop.name, x => {
        result = {
            scope: {
                statement: '=',
            },
            link: function (scope, element, attrs) {
                scope.getAvailableVariablesList = getAvailableVariablesList;
            },
            template: `
            Loop
            
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text">Array</span>
                </div>
                <select 
                    class="custom-select"
                    ng-model="statement.array"
                    ng-options="v.name as v.name for v in getAvailableVariablesList()">
                </select>
            </div>
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text">Element</span>
                </div>
                <input 
                    class="form-control" 
                    ng-model="statement.element" />
                </div>
            </div>
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text">Index</span>
                </div>
                <input 
                    class="form-control" 
                    ng-model="statement.index" />
                </div>
            </div>

            <edit-flow-statement statement="statement.statement">
            <edit-flow-statement>
            `
        };
    });
    return result;
}
