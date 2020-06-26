
const u = require("wlj-utilities");
const flow = require("wlj-flow");
const getState = require("./getState");
const getEditFlow = require("./getEditFlow");

module.exports = directiveEditFlow;

function directiveEditFlow() {
    let result;
    u.scope(directiveEditFlow.name, x => {
        result = {
            link: function (scope, element, attrs) {
                u.scope(directiveEditFlow.name + ' link', x => {
                    scope.state = getState();

                    scope.back = () => {
                        getState().screen = 'flows';
                    }

                    scope.tests = () => {
                        getState().screen = 'tests';
                    }

                    scope.flow = getEditFlow;

                    scope.getTests = (flow) => {
                        return getState().tests.filter(t => t.name === flow.name);
                    }

                    if (scope.flow().statement === null) {
                        scope.flow().statement = flow.steps([]);
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

                    scope.addVariable = () => {
                        let counter = scope.flow().variables.length + 1;
                        let newVariable = {
                            name: 'variable' + counter,
                            type: flow.typeInt(),
                        }
                        scope.flow().variables.push(newVariable);
                    }

                    scope.deleteInput = (input) => {
                        let index = scope.flow().inputs.indexOf(input);
                        scope.flow().inputs.splice(index, 1);
                    }

                    scope.deleteOutput = (output) => {
                        let index = scope.flow().outputs.indexOf(output);
                        scope.flow().outputs.splice(index, 1);
                    }

                    scope.deleteVariable = (variable) => {
                        let index = scope.flow().variables.indexOf(variable);
                        scope.flow().variables.splice(index, 1);
                    }

                    scope.statementTypes = [
                        { $type: 'evaluate', name: 'Evaluate' },
                        { $type: 'execute', name: 'Execute' },
                        { $type: 'loop', name: 'Loop' },
                        { $type: 'set', name: 'Set' },
                        { $type: 'steps', name: 'Steps' },
                    ];

                    let statementTypes = scope.statementTypes.map(st => st.$type);

                    u.merge(x, () => flow.getStatements());
                    u.merge(x, () => statementTypes);
                    u.assert(() => u.isSetEqual(statementTypes, flow.getStatements()));

                    scope.setStatementType = (st) => {
                        if (getState().editFlowStatementType &&
                            getState().editFlowStatementType.$type === st.$type) {
                            getState().editFlowStatementType = null;
                        } else {
                            getState().editFlowStatementType = st;
                        }
                    };

                    scope.baseTypes = [
                        flow.typeInt().$type,
                        flow.typeChar().$type,
                        flow.typeBool().$type,
                    ];

                    scope.types = scope.baseTypes.concat([
                        flow.typeList().$type,
                    ]);

                    scope.inputTypeChanged = (input) => {
                        if (input.type.$type === 'typeList') {
                            input.type.nested = flow.typeChar();
                        } else {
                            delete input.type.nested;
                        }
                    }

                    console.log(scope.types);
                });
            },
            template: `
            <button 
                type="button" 
                class="btn btn-primary"
                ng-click="back()">
                Back to Flows
            </button>
            <button 
                type="button" 
                class="btn btn-primary"
                ng-click="tests()">
                Tests ({{ getTests(flow()).length }})
            </button>
            <div class="card mt-1">
                <div class="card-body">
                    <h4>
                        Edit Flow - {{ flow().name }}
                    </h4>
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

                    <div class="card mt-1">
                        <div class="card-body">
                            <h5 class="card-title">Inputs</h5>
                            <div>
                                <span ng-if="flow().inputs.length === 0">
                                    (None)
                                </span>
                            </div>
                            <div class="input-group"
                                ng-repeat="input in flow().inputs">
                                <button 
                                    ng-click="deleteInput(input)"
                                    class="btn btn-danger">
                                    Delete
                                </button>
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Name</span>
                                </div>
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    placeholder="Name"
                                    ng-model="input.name">
                                <select 
                                    class="custom-select"
                                    ng-model="input.type.$type"
                                    ng-change="inputTypeChanged(input)"
                                    ng-options="t as t for t in types">
                                </select>
                                <select 
                                    ng-if="input.type.$type == 'typeList'"
                                    class="custom-select"
                                    ng-model="input.type.nested.$type"
                                    ng-options="t as t for t in baseTypes">
                                </select>
                            </div>
                            <div>
                            <button 
                                ng-click="addInput()"
                                class="btn btn-primary">
                                Add
                            </button>
                            </div>

                        </div>
                    </div>

                    <div class="card mt-1">
                        <div class="card-body">
                            <div>
                            <h5 class="card-title">Outputs</h5>
                                <span ng-if="flow().outputs.length === 0">
                                    (None)
                                </span>
                            </div>
                            <div class="input-group"
                                ng-repeat="output in flow().outputs track by $index">
                                <button 
                                    ng-click="deleteOutput(output)"
                                    class="btn btn-danger">
                                    Delete
                                </button>
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Name</span>
                                </div>
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    placeholder="Name"
                                    ng-model="output.name">
                                <select 
                                    class="custom-select"
                                    ng-model="output.type.$type"
                                    ng-change="inputTypeChanged(output)"
                                    ng-options="t as t for t in types">
                                </select>
                                <select 
                                    ng-if="output.type.$type == 'typeList'"
                                    class="custom-select"
                                    ng-model="output.type.nested.$type"
                                    ng-options="t as t for t in baseTypes">
                                </select>
                            </div>
                            <div>
                            <button 
                                ng-click="addOutput()"
                                class="btn btn-primary">
                                Add
                            </button>
                            </div>
                        </div>
                    </div>

                    <div class="card mt-1">
                        <div class="card-body">
                            <div>
                                <h5 class="card-title">Variables</h5>
                                <span ng-if="flow().variables.length === 0">
                                    (None)
                                </span>
                            </div>
                            <div class="input-group"
                                ng-repeat="variable in flow().variables">
                                <button 
                                    ng-click="deleteVariable(variable)"
                                    class="btn btn-danger">
                                    Delete
                                </button>
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Name</span>
                                </div>
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    placeholder="Name"
                                    ng-model="variable.name">
                            </div>
                            <div>
                            <button 
                                ng-click="addVariable()"
                                class="btn btn-primary">
                                Add
                            </button>
                            </div>
                        </div>
                    </div>

                    <div class="mt-1 mb-1">
                        <button 
                            ng-repeat="st in statementTypes"
                            ng-click="setStatementType(st)"
                            ng-class="{ 
                                'btn-primary': st.$type == state.editFlowStatementType.$type, 
                                'btn-secondary': st.$type != state.editFlowStatementType.$type
                            }"
                            class="btn">
                            {{ st.name }}
                        </button>
                    </div>

                    <edit-flow-statement statement="flow().statement">
                    <edit-flow-statement>
                </div>
            </div>
            `
        };
    });
    return result;
}
