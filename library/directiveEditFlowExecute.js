
const u = require("wlj-utilities");
const flow = require("wlj-flow");
const getState = require("./getState");
const getAvailableVariablesForType = require("./getAvailableVariablesForType");

module.exports = directiveEditFlowExecute;

function directiveEditFlowExecute() {
    let result;
    u.scope(directiveEditFlowExecute.name, x => {
        result = {
            scope: {
                statement: '=',
            },
            link: function (scope, element, attrs) {
                scope.state = getState();

                scope.selectedFlow = function selectedFlow() {
                    let result;
                    u.scope('selectedFlow', x=> {
                        u.merge(x, () => scope.statement)
                        u.merge(x, () => scope.statement.name)
                        result = u.arraySingle(getState().flows, {name:scope.statement.name});
                    })
                    return result
                }

                scope.getAvailableVariablesForType = getAvailableVariablesForType;
            },
            template: `
            <div>
                Execute
            </div>
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text">Flow</span>
                </div>
                <select 
                    class="custom-select"
                    ng-model="statement.name"
                    ng-options="f.name as f.name for f in state.flows">
                </select>
            </div>

            <div>Inputs</div>
            <div class="input-group"
                ng-repeat="input in selectedFlow().inputs">
                <div class="input-group-prepend">
                    <span class="input-group-text">{{input.name}}</span>
                </div>
                <select 
                    class="custom-select"
                    ng-model="statement.inputs[input.name]"
                    ng-options="v.name as v.name for v in getAvailableVariablesForType(input.type)">
                </select>                
            </div>

            <div>Outputs</div>
            <div class="input-group"
                ng-repeat="output in selectedFlow().outputs">
                <div class="input-group-prepend">
                    <span class="input-group-text">{{output.name}}</span>
                </div>
                <select 
                    class="custom-select"
                    ng-model="statement.outputs[output.name]"
                    ng-options="v.name as v.name for v in getAvailableVariablesForType(output.type)">
                </select>                
            </div>
            `
        };
    });
    return result;
}
