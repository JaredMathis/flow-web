
const u = require("wlj-utilities");
const getState = require("./getState");
const getEditFlow = require('./getEditFlow');

module.exports = directiveTests;

function directiveTests() {
    let result;
    u.scope(directiveTests.name, x => {
        result = {
            link: function (scope, element, attrs) {
                scope.back = () => {
                    getState().screen = 'flows';
                }
                scope.editor = () => {
                    getState().screen = 'editFlow';
                }

                scope.flow = getEditFlow;

                scope.getTests = () => getState()
                    .tests
                    .filter(t => t.name === getEditFlow().name);
            },
            template: `
            <div>
            <button 
                type="button" 
                class="btn btn-primary"
                ng-click="back()">
                Back to Flows
            </button>
            <button 
                type="button" 
                class="btn btn-primary"
                ng-click="editor()">
                Editor
            </button>
            </div>

            {{ flow().name }} Tests
            <table class="table">
                <tbody>
                    <tr ng-repeat="test in getTests() track by $index">
                        <td>
                        Inputs
                        <div>{{ test.input }}</div>
                        Outputs
                        <div>{{ test.output }}</div>
                        </td>
                    </tr>
                </tbody>
            </table>
            
            {{ tests }}
            `
        }
    });
    return result;
}
