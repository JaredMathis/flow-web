
const u = require("wlj-utilities");
const flow = require("wlj-flow");
const library = flow.getLibrary();

module.exports = directiveFlows;

function directiveFlows() {
    let result;
    u.scope(directiveFlows.name, x => {
        result = {
            link: function (scope, element, attrs) {
                scope.flows = library.map(f => "flow/" + f.name);
            },
            template: `
            <table class="table">
                <tbody>
                    <tr ng-repeat="flow in flows">
                        <td>{{flow}}</td>
                    <tr>
                </tbody>
            </table>
            <button 
                type="button" 
                class="btn btn-primary">
                Create New Flow
            </button>
            `
        }
    });
    return result;
}
