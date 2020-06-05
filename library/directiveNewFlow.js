
const u = require("wlj-utilities");
const flow = require("wlj-flow");
const getState = require("./getState");

module.exports = directiveNewFlow;

function directiveNewFlow() {
    let result;
    u.scope(directiveNewFlow.name, x => {
        result = {
            link: function (scope, element, attrs) {
                scope.state = getState();
                scope.state.newFlow = {

                };

                scope.cancel = () => {
                    getState().screen = 'flows';
                }

                scope.create = () => {
                    let newFlow = flow.defineFunction(
                        getState().newFlow.name,
                        [],
                        [],
                        null);
                    getState().flows.push(newFlow);
                }
            },
            template: `
            <input 
                focus
                type="text" 
                class="form-control" 
                placeholder="Flow name"
                ng-model="state.newFlow.name">
            <button 
                type="button" 
                class="btn btn-primary"
                ng-click="create()">
                Create
            </button>
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
