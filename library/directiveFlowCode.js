
const u = require("wlj-utilities");


module.exports = directiveFlowCode;

function directiveFlowCode() {
    let result;
    u.scope(directiveFlowCode.name, x => {
        result = {
            scope: {
                statement: '=',
            },
            link: function (scope, element, attrs) {
            },
            template: `
            Flow Code
            `
        };
    });
    return result;
}
