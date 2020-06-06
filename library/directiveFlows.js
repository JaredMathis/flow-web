
const u = require("wlj-utilities");
const flow = require("wlj-flow");
const library = flow.getLibrary();

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

                scope.deleteFlow = (flow) => {
                    let index = getState().flows.indexOf(flow);
                    getState().flows.splice(index, 1);
                };

                scope.editFlow = (flow) => {
                    let index = getState().flows.indexOf(flow);
                    getState().screen = "editFlow";
                };
            },
            template: `
            <button 
                type="button" 
                class="btn btn-primary"
                ng-click="createNewFlow()">
                Create New Flow
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
                            Edit
                        </button>

                        <button 
                            ng-click="deleteFlow(flow)"
                            type="button" 
                            class="btn btn-danger">
                            Delete
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
