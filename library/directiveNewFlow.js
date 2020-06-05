
const u = require("wlj-utilities");

module.exports = directiveNewFlow;

function directiveNewFlow() {
    let result;
    u.scope(directiveNewFlow.name, x => {
        result = {
            link: function (scope, element, attrs) {
            },
            template: `
            <input 
                focus
                type="text" 
                class="form-control" 
                placeholder="Flow name">
            `
        };
    });
    return result;
}
