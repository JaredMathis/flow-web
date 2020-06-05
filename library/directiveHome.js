
const u = require("wlj-utilities");

module.exports = directiveHome;

function directiveHome() {
    let result;
    u.scope(directiveHome.name, x => {
        result = {
            link: function (scope, element, attrs) {

            },
            template: `
            <flows></flows>
            `
        }
    });
    return result;
}
