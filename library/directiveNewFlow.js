
const u = require("wlj-utilities");
const getState = require("./getState");

module.exports = directiveNewFlow;

function directiveNewFlow() {
    let result;
    u.scope(directiveNewFlow.name, x => {
        result = {
            link: function (scope, element, attrs) {
                scope.cancel = () => {
                    getState().screen = 'flows';
                }
            },
            template: `
            <input 
                focus
                type="text" 
                class="form-control" 
                placeholder="Flow name">
            <button 
                type="button" 
                class="btn btn-secondary"
                ng-click="cancel()">
                Cancel
            </button>
            `
        };
    });
    return result;
}
