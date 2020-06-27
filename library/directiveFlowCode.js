
const u = require("wlj-utilities");
const getEditFlow = require("./getEditFlow");
const getState = require("./getState");
const compile = require("wlj-flow/library/compile");

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

                let lines = compile(scope.flow(), getState().flows);
                let compiled = lines.join(u.EOL);
                scope.code = compiled;
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
