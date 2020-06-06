
const u = require("wlj-utilities");
const flow = require("wlj-flow");
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

                scope.addInput = () => {
                    let counter = getState().flows[getState().editFlowIndex].inputs.length + 1;
                    let newInput = {
                        name: 'input' + counter,
                        type: flow.typeInt(),
                    }
                    getState().flows[getState().editFlowIndex].inputs.push(newInput);
                }

                scope.addOutput = () => {
                    let counter = getState().flows[getState().editFlowIndex].outputs.length + 1;
                    let newOutput = {
                        name: 'output' + counter,
                        type: flow.typeInt(),
                    }
                    getState().flows[getState().editFlowIndex].outputs.push(newOutput);
                }

                scope.deleteInput = (input) => {
                    let index = getState().flows[getState().editFlowIndex].inputs.indexOf(input);
                    getState().flows[getState().editFlowIndex].inputs.splice(index, 1);
                }
            },
            template: `
            <button 
                type="button" 
                class="btn btn-primary"
                ng-click="back()">
                Back to Flows
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
                <button 
                    ng-click="deleteInput(input)"
                    class="btn btn-danger">
                    Delete Input
                </button>
            </div>
            <div>
            <button 
                ng-click="addInput()"
                class="btn btn-primary">
                Add Input
            </button>
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
            <div>
            <button 
                ng-click="addOutput()"
                class="btn btn-primary">
                Add Output
            </button>
            </div>
            `
        };
    });
    return result;
}
