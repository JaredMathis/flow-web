
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

                scope.flow = () => {
                    return getState().flows[getState().editFlowIndex];
                }

                scope.addInput = () => {
                    let counter = scope.flow().inputs.length + 1;
                    let newInput = {
                        name: 'input' + counter,
                        type: flow.typeInt(),
                    }
                    scope.flow().inputs.push(newInput);
                }

                scope.addOutput = () => {
                    let counter = scope.flow().outputs.length + 1;
                    let newOutput = {
                        name: 'output' + counter,
                        type: flow.typeInt(),
                    }
                    scope.flow().outputs.push(newOutput);
                }

                scope.deleteInput = (input) => {
                    let index = scope.flow().inputs.indexOf(input);
                    scope.flow().inputs.splice(index, 1);
                }

                scope.deleteOutput = (output) => {
                    let index = scope.flow().outputs.indexOf(output);
                    scope.flow().outputs.splice(index, 1);
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
                Edit Flow - {{ flow().name }}
            </div>
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text">Name</span>
                </div>
                <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Flow name"
                    ng-model="flow().name">
            </div>
            
            <Div>
                Inputs 
                <span ng-if="flow().inputs.length === 0">
                    (None)
                </span>
            </div>
            <div class="input-group"
                ng-repeat="input in flow().inputs">
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
                <span ng-if="flow().outputs.length === 0">
                    (None)
                </span>
            </div>
            <div class="input-group"
                ng-repeat="output in flow().outputs track by $index">
                <div class="input-group-prepend">
                    <span class="input-group-text">Name</span>
                </div>
                <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Name"
                    ng-model="output.name">
                <button 
                    ng-click="deleteOutput(output)"
                    class="btn btn-danger">
                    Delete Output
                </button>
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
