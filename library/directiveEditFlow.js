
const u = require("wlj-utilities");
const getState = require("./getState");

module.exports = directiveEditFlow;

function directiveEditFlow() {
    let result;
    u.scope(directiveEditFlow.name, x => {
        result = {
            link: function (scope, element, attrs) {
                scope.state = getState();

                scope.back = () => {
                    getState().screen = 'flows';
                }
            },
            template: `
            <button 
                type="button" 
                class="btn btn-primary"
                ng-click="back()">
                Back
            </button>
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text">Flow name</span>
                </div>
                <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Flow name"
                    ng-model="state.flows[state.editFlowIndex].name">
            </div>
            Inputs
            `
        };
    });
    return result;
}
