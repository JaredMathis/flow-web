
const u = require("wlj-utilities");
const flow = require("wlj-flow");
const getState = require("./getState");
const getEditFlow = require("./getEditFlow");

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

                scope.selectedFlow = () => {
                    let result;
                    u.scope('selectedFlow', x=> {
                        u.merge(x, () => scope.statement.name)
                        result = u.arraySingle(getState().flows, {name:scope.statement.name});
                    })
                    return result
                }

                scope.getAvailableVariables = () => {
                    return flow.getAvailableVariables(getEditFlow())
                }

                scope.getAvailableVariablesForType = type => {
                    return scope.getAvailableVariables()
                        .filter(v => JSON.stringify(v.type) === JSON.stringify(type))
                }
            },
            template: `
            <div>
                Execute
            </div>
            <select 
                class="custom-select"
                ng-model="statement.name"
                ng-options="f.name as f.name for f in state.flows">
            </select>

            <div>Inputs</div>
            <div ng-repeat="input in selectedFlow().inputs">
                <select 
                    class="custom-select"
                    ng-model="statement.inputs[input.name]"
                    ng-options="v.name as v.name for v in getAvailableVariablesForType(input.type)">
                </select>                
            </div>

            <div>Outputs</div>
            <div ng-repeat="output in selectedFlow().outputs">
                <select 
                    class="custom-select"
                    ng-model="statement.outputs[output.name]"
                    ng-options="v.name as v.name for v in getAvailableVariablesForType(output.type)">
                </select>                
            </div>

            {{ statement }}
            `
        };
    });
    return result;
}
