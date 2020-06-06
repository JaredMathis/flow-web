
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


            },
            template: `
            <div>
                Execute
            </div>
            <select 
                class="custom-select"
                ng-model="statement.name"
                ng-options="f.name for f in state.flows track by f.name">
            </select>
            `
        };
    });
    return result;
}
