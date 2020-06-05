
const u = require("wlj-utilities");

module.exports = directiveNewFlow;

function directiveNewFlow() {
    let result;
    u.scope(directiveNewFlow.name, x => {
        result = {
            link: function (scope, element, attrs) {
                scope.flows = library.map(f => "flow/" + f.name);
            },
            template: `
            New Flow
            `
        };
    });
    return result;
}
