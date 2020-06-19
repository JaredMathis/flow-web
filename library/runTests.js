
const u = require("wlj-utilities");
const flow = require('wlj-flow');
const compileAndTest = require('wlj-flow/tests/compile/compileAndTest');
const getState = require("./getState");
const compileAssertHasOwnProperty = flow.compileAssertHasOwnProperty;
const compileAssertIsType = flow.compileAssertIsType;

module.exports = runTests;

function runTests(tests) {
    let result;
    u.scope(runTests.name, x => {
        u.loop(tests, t => {
            console.log('testing', {t});
            t.run = {};
            t.run.when = new Date();
            compileAndTest(getState().flows, (text) => {
                let code;
                let actual;
                try {
                    eval(text);
    
                    u.merge(x, () => t.name);

                    let input = {};
                    for (let k in t.input) {
                        input[k] = JSON.parse(t.input[k]);
                    }

                    code = `actual = ${t.name}(${JSON.stringify(input)})`;
                    eval(code);

                    let expected = {};
                    for (let k in t.output) {
                        expected[k] = JSON.parse(t.output[k]);
                    }

                    if (t.expectError === true) {
                        t.run.success = false;
                        t.run.actualOutput = actual;
                    } else {
                        u.assertIsEqualJson(() => actual, () => expected);
                        t.run.success = true;
                    }
                } catch (e) {
                    if (t.expectError === true) {
                        t.run.success = true;
                    } else {
                        console.log({code});
                        t.run.success = false;
                        e = e.innerError || e;
                        let message = e.message || e;
                        t.run.message = message.toString();
                    }
                }
            });
        });
    });
    return result;
}
