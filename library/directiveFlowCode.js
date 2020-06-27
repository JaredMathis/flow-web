
const u = require("wlj-utilities");
const getEditFlow = require("./getEditFlow");
const getState = require("./getState");
const compileAndTest = require("wlj-flow/tests/compile/compileAndTest");


module.exports = directiveFlowCode;

function directiveFlowCode() {
    let result;
    u.scope(directiveFlowCode.name, x => {
        result = {
            scope: {
                statement: '=',
            },
            link: function (scope, element, attrs) {
                scope.flow = getEditFlow;

                scope.back = () => {
                    getState().screen = 'editFlow';
                }

                compileAndTest([scope.flow()], text => {
                    scope.code = text;
                });
            },
            template: `
            <button 
                type="button" 
                class="btn btn-primary"
                ng-click="back()">
                Back to Flow {{flow().name}}
            </button>

            <div class="card">
                <div class="card-body">
                    <pre>{{ code }}</pre>
                </div>
            </div>
            `
        };
    });
    return result;
}
