
const u = require("wlj-utilities");
const flow = require("wlj-flow");
const library = flow.getLibrary();

const downloadFromServer = require('./downloadFromServer')

module.exports = directiveHome;

function directiveHome() {
    let result;
    u.scope(directiveHome.name, x => {
        result = {
            link: function (scope, element, attrs) {
                let libraryNames = library.map(f => "flow/" + f.name);
                scope.downloaded = downloadFromServer(libraryNames);
                
            },
            template: `
            {{downloaded}}
            `
        }
    });
    return result;
}
