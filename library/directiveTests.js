
const u = require("wlj-utilities");
const getState = require("./getState");

module.exports = directiveTests;

function directiveTests() {
    let result;
    u.scope(directiveTests.name, x => {
        result = {
            link: function (scope, element, attrs) {
                scope.back = () => {
                    getState().screen = 'flows';
                }
                scope.editor = () => {
                    getState().screen = 'editFlow';
                }
            },
            template: `
            <button 
                type="button" 
                class="btn btn-primary"
                ng-click="back()">
                Back to Flows
            </button>
            <button 
                type="button" 
                class="btn btn-primary"
                ng-click="editor()">
                Editor
            </button>
            
            `
        }
    });
    return result;
}
