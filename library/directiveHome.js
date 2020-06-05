
const u = require("wlj-utilities");
const flow = require("wlj-flow");
const library = flow.getLibrary();

module.exports = directiveHome;

function directiveHome() {
    let result;
    u.scope(directiveHome.name, x => {
        result = {
            link: function (scope, element, attrs) {
                scope.libraryNames = library.map(f => "flow/" + f.name);
            },
            template: `
            {{libraryNames}}
            `
        }
    });
    return result;
}
