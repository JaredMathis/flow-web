
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
                scope.flows = library.map(f => "flow/" + f.name);

                scope.createNewFlow = () => {
                    getState().screen = "newFlow";
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
                    <tr ng-repeat="flow in flows">
                        <td>{{flow}}</td>
                    <tr>
                </tbody>
            </table>
            `
        }
    });
    return result;
}
