
const u = require("wlj-utilities");
const flow = require('wlj-flow');
const compileAndTest = require('wlj-flow/tests/compile/compileAndTest');
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
            compileAndTest((text) => {
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

                    u.assertIsEqualJson(() => actual, () => expected);

                    t.run.success = true;
                } catch (e) {
                    console.log(text);
                    console.log({code});
                    t.run.success = false;
                    throw e;
                }
            });
        });
    });
    return result;
}
