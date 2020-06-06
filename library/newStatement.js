
const u = require("wlj-utilities");
const flow = require("wlj-flow");
const getState = require("./getState");

module.exports = newStatement;

function newStatement() {
    let result;
    u.scope(newStatement.name, x => {
        let statements = {
            'block': () => {
                u.assert(false);  
            },
            'evaluate': () => {
                u.assert(false);  
            },
            'execute': () => {
                return flow.execute(null, [], []);
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
