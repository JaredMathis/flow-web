
const u = require("wlj-utilities");
const flow = require("wlj-flow");

const getState = require("./getState");

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
            },
            template: `
            <button 
                type="button" 
                class="btn btn-primary"
                ng-click="createNewFlow()">
                Create New Flow
            </button>
            <button 
                type="button" 
                class="btn btn-primary"
                ng-click="data()">
                Data
            </button>
            <table class="table">
                <tbody>
                    <tr ng-repeat="flow in state.flows track by $index">
                        <td>
                            <b>{{flow.name}}</b>
                            (
                                <span ng-repeat="i in flow.inputs">
                                    <span ng-show="!$first">,</span>
                                    {{ i.name }}
                                </span>
                            )
                            =>
                            (
                                <span ng-repeat="o in flow.outputs">
                                    <span ng-show="!$first">,</span>
                                    {{ o.name }}
                                </span>
                            )
                        </td>
                        <td>

                        <button 
                            ng-click="editFlow(flow)"
                            type="button" 
                            class="btn btn-primary">
                            Edit Flow
                        </button>

                        <button 
                            ng-click="testFlow(flow)"
                            type="button" 
                            class="btn btn-primary">
                            Tests ({{ getTests(flow).length }})
                        </button>

                        <button 
                            ng-click="deleteFlow(flow)"
                            type="button" 
                            class="btn btn-danger">
                            Delete Flow
                        </button>
                        </td>
                    <tr>
                </tbody>
            </table>
            `
        }
    });
    return result;
}
