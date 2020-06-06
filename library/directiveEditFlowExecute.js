
const u = require("wlj-utilities");
const getState = require("./getState");

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
                {{ input }}
            </div>
            `
        };
    });
    return result;
}
