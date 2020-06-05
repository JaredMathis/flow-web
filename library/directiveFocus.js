
const u = require("wlj-utilities");

module.exports = directiveFocus;

function directiveFocus() {
    let result;
    u.scope(directiveFocus.name, x => {
        result = {
            link: function (scope, element, attrs) {
                element[0].focus();
            }
        };
    });
    return result;
}
