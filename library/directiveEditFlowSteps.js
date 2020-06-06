
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

                scope.deleteStatement = (s) => {
                    let index = scope.statement.steps.indexOf(s);
                    scope.statement.steps.splice(index, 1);
                }
            },
            template: `
            <div>
                Steps
            </div>
            <div ng-repeat="s in statement.steps track by $index">  
                <button 
                    class="btn btn-danger"
                    ng-click="deleteStatement(s)">
                    Delete Statement
                </button>
                <edit-flow-statement
                    statement="s">
                </edit-flow-statement>
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
