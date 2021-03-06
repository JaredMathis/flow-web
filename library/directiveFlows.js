
const u = require("wlj-utilities");
const flow = require("wlj-flow");

const getState = require("./getState");
const runTests = require("./runTests");

module.exports = directiveFlows;

function directiveFlows() {
    let result;
    u.scope(directiveFlows.name, x => {
        result = {
            link: function (scope, element, attrs) {
                scope.createNewFlow = () => {
                    getState().screen = "newFlow";
                };
                scope.data = () => {
                    getState().screen = "data";
                };
                scope.getState = getState;
                scope.runAllTests = () => {
                    getState().runAllTestsLastRun = new Date();
                    runTests(getState().tests);
                };

                scope.deleteFlow = (flow) => {
                    let index = getState().flows.indexOf(flow);
                    getState().flows.splice(index, 1);
                };

                scope.editFlow = (flow) => {
                    let index = getState().flows.indexOf(flow);
                    getState().editFlowIndex = index;
                    getState().screen = "editFlow";
                };

                scope.testFlow = (flow) => {
                    let index = getState().flows.indexOf(flow);
                    getState().editFlowIndex = index;
                    getState().screen = "tests";
                };

                scope.getTests = (flow) => {
                    return getState().tests.filter(t => t.name === flow.name);
                }
                scope.getSuccessfulTests = (flow) => {
                    return scope.getTests(flow).filter(t => t.run && t.run.success === true);
                }

                scope.allSuccessfulTests = function () {
                    return scope
                        .getState()
                        .tests
                        .filter(t => t.run && t.run.success === true)
                }
            },
            template: `
            <button 
                type="button" 
                class="btn btn-primary"
                ng-click="data()">
                Data
            </button>

            <div class="card mt-1">
                <div class="card-body">
                    <h4 class="card-title">Flows</h4>

                    <button 
                        type="button" 
                        class="btn btn-primary"
                        ng-click="runAllTests()">
                        Run All Tests
                    </button>
                    Last ran: {{getState().runAllTestsLastRun || 'Never'}}
                    - {{ allSuccessfulTests().length }} 
                    out of {{ getState().tests.length }} successful

                    <br>
                    <button 
                        type="button" 
                        class="btn btn-primary mt-1"
                        ng-click="createNewFlow()">
                        Create New Flow
                    </button>
                    <table class="table mt-1">
                        <tbody>
                            <tr 
                            ng-repeat="flow in state.flows track by $index"
                            ng-class="{ 
                                'table-success': getTests(flow).length >= 1 && getSuccessfulTests(flow).length == getTests(flow).length,
                                'table-danger': getTests(flow).length >= 1 && getSuccessfulTests(flow).length != getTests(flow).length,
                                'table-warning': getTests(flow).length == 0,
                            }">
                            
                                <td>
                                    <button 
                                        ng-click="deleteFlow(flow)"
                                        type="button" 
                                        class="btn btn-danger">
                                        Delete
                                    </button> 

                                    <button 
                                        ng-click="editFlow(flow)"
                                        type="button" 
                                        class="btn btn-primary">
                                        Edit
                                    </button>

                                    <button 
                                        ng-click="testFlow(flow)"
                                        type="button" 
                                        class="btn btn-primary">
                                        Tests ({{ getTests(flow).length }})
                                    </button>

                                    <b class="ml-1">{{flow.name}}</b>
                                    (&nbsp;<span ng-repeat="i in flow.inputs"><span ng-show="!$first">&nbsp;, </span>{{ i.name }}</span>&nbsp;)&nbsp;=>
                                    (&nbsp;<span ng-repeat="o in flow.outputs"><span ng-show="!$first">&nbsp;, </span>{{ o.name }}</span>&nbsp;)
                                </td>
                            <tr>
                        </tbody>
                    </table>
                </div>
            </div>
            `
        }
    });
    return result;
}
