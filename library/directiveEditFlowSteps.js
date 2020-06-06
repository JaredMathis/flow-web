
const u = require("wlj-utilities");

module.exports = directiveEditFlowSteps;

function directiveEditFlowSteps() {
    let result;
    u.scope(directiveEditFlowSteps.name, x => {
        result = {
            scope: {
                statement: '=',
            },
            link: function (scope, element, attrs) {
            },
            template: `
            edit-flow-steps
            `
        };
    });
    return result;
}
