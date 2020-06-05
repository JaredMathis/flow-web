
const u = require("wlj-utilities");
const getState = require('./getState');

module.exports = directiveHome;

function directiveHome() {
    let result;
    u.scope(directiveHome.name, x => {
        result = {
            link: function (scope, element, attrs) {
                scope.state = getState();

                getState().screen = "flows";
            },
            template: `
            <div ng-if="state.screen == 'flows'">
                <flows></flows>
            </div>
            <div ng-if="state.screen == 'newFlow'">
                <new-flow></new-flow>
            </div>
            `
        }
    });
    return result;
}
