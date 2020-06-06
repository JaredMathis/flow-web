
const u = require("wlj-utilities");
const flow = require("wlj-flow");
const getState = require("./getState");
const newStatement = require("./newStatement");

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

                scope.addStatement = () => {
                    let statement = newStatement();
                    scope.statement.steps.push(statement);
                };
            },
            template: `
            <div>
                Steps
            </div>
            <div>
                {{ statement.steps }}
            </div>
            <button 
                class="btn btn-primary"
                ng-click="addStatement()"
                ng-show="state.editFlowStatementType">
                Add {{state.editFlowStatementType.name}} Statement
            </button>
            `
        };
    });
    return result;
}
