
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
            <div>
                Edit Flow - {{ state.flows[state.editFlowIndex].name }}
            </div>
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text">Name</span>
                </div>
                <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Flow name"
                    ng-model="state.flows[state.editFlowIndex].name">
            </div>
            
            <Div>
                Inputs 
                <span ng-if="state.flows[state.editFlowIndex].inputs.length === 0">
                    (None)
                </span>
            </div>
            <div class="input-group"
                ng-repeat="input in state.flows[state.editFlowIndex].inputs">
                <div class="input-group-prepend">
                    <span class="input-group-text">Name</span>
                </div>
                <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Name"
                    ng-model="input.name">
            </div>

            <div>
                Outputs
                <span ng-if="state.flows[state.editFlowIndex].outputs.length === 0">
                    (None)
                </span>
            </div>
            <div class="input-group"
                ng-repeat="output in state.flows[state.editFlowIndex].outputs">
                <div class="input-group-prepend">
                    <span class="input-group-text">Name</span>
                </div>
                <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Name"
                    ng-model="output.name">
            </div>
            `
        };
    });
    return result;
}
