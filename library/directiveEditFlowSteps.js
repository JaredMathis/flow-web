
const u = require("wlj-utilities");
const flow = require("wlj-flow");
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

                scope.addStatement = () => {
                    let statements = {
                        'block': () => {
                            u.assert(false);  
                        },
                        'evaluate': () => {
                            u.assert(false);  
                        },
                        'execute': () => {
                            u.assert(false);  
                        },
                        'loop': () => {
                            u.assert(false);                            
                        },
                        'set': () => {
                            u.assert(false);                            
                        },
                        'steps': () => {
                            u.assert(false);
                        },
                    };

                    u.assert(() => u.arraySequenceEquals(Object.keys(statements), flow.getStatements()));

                    statements[getState().$type]();
                };
            },
            template: `
            <div>
                Steps
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
