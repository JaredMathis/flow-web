
const u = require("wlj-utilities");

module.exports = directiveEditFlowBlock;

function directiveEditFlowBlock() {
    let result;
    u.scope(directiveEditFlowBlock.name, x => {
        result = {
            scope: {
                statement: '=',
            },
            link: function (scope, element, attrs) {
            },
            template: `
            Block
            <edit-flow-statement 
                statement="statement.statement">
            </edit-flow-statement>
            `
        };
    });
    return result;
}
