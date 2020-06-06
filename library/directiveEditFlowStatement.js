
const u = require("wlj-utilities");
const flow = require("wlj-flow");

module.exports = directiveEditFlowStatement;

let log = false;
let template;
u.scope(__filename, x => {
    template = flow.getStatements().map(s => `
<div ng-if="statement.$type == '${s}'">
    <edit-flow-${s} statement="statement">
    </edit-flow-${s}>
</div>
`).join('');

    if (log) console.log(template)
})

function directiveEditFlowStatement() {
    let result;
    u.scope(directiveEditFlowStatement.name, x => {
        result = {
            scope: {
                statement: '=',
            },
            link: function (scope, element, attrs) {
            },
            template: `
            <div class="card">
                <div class="card-body">
                    ${template}
                </div>
            </div>
            `
        };
    });
    return result;
}
