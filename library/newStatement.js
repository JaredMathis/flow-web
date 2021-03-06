
const u = require("wlj-utilities");
const flow = require("wlj-flow");
const getState = require("./getState");

module.exports = newStatement;

function newStatement() {
    let result;
    u.scope(newStatement.name, x => {
        let statements = {
            'evaluate': () => {
                return flow.evaluate(''); 
            },
            'execute': () => {
                return flow.execute(null, {}, {});
            },
            'ifElse': () => {
                return flow.ifElse(
                    null, 
                    flow.steps([]), 
                    flow.steps([])
                );                            
            },
            'loop': () => {
                u.assert(false);                            
            },
            'set': () => {
                u.assert(false);                            
            },
            'steps': () => {
                return flow.steps([]);
            },
        };

        u.assert(() => u.arraySequenceEquals(Object.keys(statements), flow.getStatements()));

        result = statements[getState().editFlowStatementType.$type]();
    });
    return result;
}
