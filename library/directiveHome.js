
const u = require("wlj-utilities");
const flow = require("wlj-flow");
const library = flow.getLibrary();
const getTests = require("wlj-flow/tests/getTests");
const getState = require('./getState');

module.exports = directiveHome;

function directiveHome() {
    let result;
    u.scope(directiveHome.name, x => {
        result = {
            link: function (scope, element, attrs) {
                scope.state = getState();

                let defaultState = require('./../data.json');
                defaultState.screen = 'flows';
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
            <div ng-if="state.screen == 'editFlow'">
                <edit-flow></edit-flow>
            </div>
            <div ng-if="state.screen == 'tests'">
                <tests></tests>
            </div>
            <div ng-if="state.screen == 'data'">
                <data></data>
            </div>
            <div ng-if="state.screen == 'flowCode'">
                <flow-code></flow-code>
            </div>
            `
        }
    });
    return result;
}
