
const u = require("wlj-utilities");
const flow = require("wlj-flow");
const libary = flow.getLibrary();
const getState = require('./getState');

module.exports = directiveHome;

function directiveHome() {
    let result;
    u.scope(directiveHome.name, x => {
        result = {
            link: function (scope, element, attrs) {
                scope.state = getState();

                let defaultState = {
                    screen: 'flows',
                    flows: libary,
                };
                u.merge(getState(), defaultState);

                let loaded;
                let json = localStorage.getItem('state');
                if (json) {
                    loaded = JSON.parse(json);
                    if (loaded) {
                        u.merge(getState(), loaded);
                    }
                }

                scope.$watch(getState,
                    (value) => {
                        localStorage.setItem('state', JSON.stringify(value));
                    },
                    // Deep watch
                    true)

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
