
const u = require("wlj-utilities");

module.exports = directiveNewFlow;

function directiveNewFlow() {
    let result;
    u.scope(directiveNewFlow.name, x => {
        result = {
            link: function (scope, element, attrs) {
            },
            template: `
            New Flow
            `
        };
    });
    return result;
}
