
const u = require("wlj-utilities");

module.exports = directiveEditFlowStatement;

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
                    <div ng-if="statement.$type == 'steps'">
                        <edit-flow-steps statement="statement">
                        </edit-flow-steps>
                    </div>
                    <div ng-if="statement.$type == 'block'">
                        <edit-flow-block statement="statement">
                        </edit-flow-block>
                    </div>
                </div>
            </div>
            `
        };
    });
    return result;
}
