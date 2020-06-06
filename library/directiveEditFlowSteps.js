
const u = require("wlj-utilities");
const getState = require("./getState");

module.exports = directiveEditFlowSteps;

function directiveEditFlowSteps() {
    let result;
    u.scope(directiveEditFlowSteps.name, x => {
        result = {
            scope: {
                statement: '=',
            },
            link: function (scope, element, attrs) {
                scope.state = getState();
            },
            template: `
            <div>
                Steps
            </div>
            <button 
                class="btn btn-primary"
                ng-show="state.editFlowStatementType">
                Add {{state.editFlowStatementType.name}} Statement
            </button>
            `
        };
    });
    return result;
}
