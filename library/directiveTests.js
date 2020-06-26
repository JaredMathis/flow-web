
const u = require("wlj-utilities");
const getState = require("./getState");
const getEditFlow = require('./getEditFlow');
const flow = require('wlj-flow');
const runTests = require('./runTests');

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

                scope.successfulTests = function () {
                    return scope.getTests().filter(t => t.run && t.run.success === true)
                }

                scope.getKeys = Object.keys;

                scope.runTests = () => {
                    let tests = scope.getTests();
                    runTests(tests);
                };

                scope.addTest = function () {
                    const newTest = {};
                    newTest.name = getEditFlow().name
                    newTest.input = {};
                    newTest.output = {};

                    getState()
                    .tests.push(newTest);
                };

                scope.deleteTest = function (test) {
                    let index = getState().tests.indexOf(test);
                    getState().tests.splice(index, 1);
                }
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
                - {{ successfulTests().length }} 
                out of {{ getTests().length }} successful

            <div>
            </div>

            <table class="table">
                <tbody>
                    <tr ng-repeat="test in getTests() track by $index"
                    ng-class="{ 'table-success': test.run.success === true, 'table-danger': test.run.success === false }">
                        <td>
                        <div>
                        <button class="btn btn-danger"
                            ng-click="deleteTest(test)">
                            Delete Test
                        </button>
                        <button class="btn btn-primary"
                            ng-click="runTests()">
                            Run Tests
                        </button>
                    Last ran: {{ test.run.when || 'Never' }}
                    </div>
                        Inputs
                        <div ng-repeat="input in flow().inputs">
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text">{{ input.name }} ({{ input.type.$type }})</span>
                </div>
                <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Input {{input.name}} value"
                    style="font-family:monospace;"
                    ng-model="test.input[input.name]">
            </div>
                        </div>
                        Outputs
                        <div>
                            <input type="checkbox" ng-model="test.expectError">
                            Expect Error
                        </div>
                        <div ng-show="!test.expectError"
                            ng-repeat="output in flow().outputs">
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text">{{ output.name }} ({{ output.type.$type }})</span>
                </div>
                <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Output {{output.name}} value"
                    style="font-family:monospace;"
                    ng-model="test.output[output.name]">
            </div>
                        </div>
                        <div ng-show="test.run.success == false">
                        <div>
                            Error message: {{ test.run.message || '[No message]' }}
                        </div>
                        Contexts:
                        <pre>{{ test.run.contexts | json }}</pre>
                        </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div>
            <button class="btn btn-primary"
                ng-click="addTest()">
                Add Test
            </button>
            </div>
            `
        }
    });
    return result;
}
