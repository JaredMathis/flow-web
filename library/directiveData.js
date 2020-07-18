
const u = require("wlj-utilities");
const getState = require("./getState");

module.exports = directiveData;

function directiveData() {
    let result;
    u.scope(directiveData.name, x => {
        result = {
            scope: {
                statement: '=',
            },
            link: function (scope, element, attrs) {
                scope.back = () => {
                    getState().screen = "flows";
                };

                scope.data = JSON.stringify(getState() || require('./../data.json'), null, 3);

                scope.updateData = () => {
                    let parsed = JSON.parse(scope.data);
                    u.loop(Object.keys(parsed), k => {
                        u.merge(getState(), parsed[k]);
                    });
                };
            },
            template: `
            <div>
            <button 
                type="button" 
                class="btn btn-primary"
                ng-click="back()">
                Back to Flows
            </button>
            </div>
            <textarea 
                class="form-control" 
                rows="10"
                style="font-family:monospace;"
                ng-model="data" 
                ng-change="updateData()">
            </textarea>
            `
        };
    });
    return result;
}
