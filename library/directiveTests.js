
const u = require("wlj-utilities");
const getState = require("./getState");
const getEditFlow = require('./getEditFlow');
const compileAndTest = require('wlj-flow/tests/compile/compileAndTest');
const flow = require('wlj-flow');
const compileAssertHasOwnProperty = flow.compileAssertHasOwnProperty;
const compileAssertIsType = flow.compileAssertIsType;

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
                    return scope.getTests().filter(t => t.success === true)
                }

                scope.getKeys = Object.keys;

                scope.runTests = () => {                    
                    u.loop(scope.getTests(), t => {
                        compileAndTest((text) => {
                            let code;
                            let actual;
                            try {
                                eval(text);
                
                                u.merge(x, () => scope.flow().name);

                                let input = {};
                                for (let k in t.input) {
                                    input[k] = JSON.parse(t.input[k]);
                                }

                                code = `actual = ${scope.flow().name}(${JSON.stringify(input)})`;
                                eval(code);

                                let expected = {};
                                for (let k in t.output) {
                                    expected[k] = JSON.parse(t.output[k]);
                                }
            
                                u.assertIsEqualJson(() => actual, () => expected);

                                t.success = true;
                            } catch (e) {
                                console.log(text);
                                console.log({code});
                                t.success = false;
                                throw e;
                            }
                        });
                    });
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
            <button class="btn btn-primary"
                ng-click="runTests()">
                Run Tests
            </button>
            </div>

            <table class="table">
                <tbody>
                    <tr ng-repeat="test in getTests() track by $index"
                    ng-class="{ 'table-success': test.success === true, 'table-danger': test.success === false }">
                        <td>
                        Inputs
                        <div ng-repeat="input in flow().inputs">
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text">{{ input.name }}</span>
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
                        <div ng-repeat="output in flow().outputs">
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text">{{ output.name }}</span>
                </div>
                <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Output {{output.name}} value"
                    style="font-family:monospace;"
                    ng-model="test.output[output.name]">
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
