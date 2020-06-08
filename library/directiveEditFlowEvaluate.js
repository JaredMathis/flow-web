
const u = require("wlj-utilities");

module.exports = directiveEditFlowEvaluate;

function directiveEditFlowEvaluate() {
    let result;
    u.scope(directiveEditFlowEvaluate.name, x => {
        result = {
            scope: {
                statement: '=',
            },
            link: function (scope, element, attrs) {
            },
            template: `
            Evaluate
            <input 
                style="font-family:monospace;"
                class="form-control" 
                ng-model="statement.expression" />
            `
        };
    });
    return result;
}
