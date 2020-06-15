
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
                
                scope.getKeys = Object.keys;
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
                        <div ng-repeat="k in getKeys(test.input)">
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text">{{ k }}</span>
                </div>
                <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Input {{k}} value"
                    style="font-family:monospace;"
                    ng-model="test.input[k]">
            </div>
                        </div>
                        Outputs
                        <div ng-repeat="k in getKeys(test.output)">
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text">{{ k }}</span>
                </div>
                <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Output {{k}} value"
                    style="font-family:monospace;"
                    ng-model="test.output[k]">
            </div>
                        </div>
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
