
const u = require("wlj-utilities");
const getEditFlow = require("./getEditFlow");
const getState = require("./getState");


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
            },
            template: `
            <button 
                type="button" 
                class="btn btn-primary"
                ng-click="back()">
                Back to Flow {{flow().name}}
            </button>
            `
        };
    });
    return result;
}
