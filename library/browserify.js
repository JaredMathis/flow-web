const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const u = require('wlj-utilities');

u.scope(__filename, x => {
    const except = [
        'browserify.js'
    ];
    let directory = './library/';
    u.merge(x, {directory});
    const files = fs.readdirSync(directory);
    u.merge(x, {files});
    const filesExcept = u.arrayExcept(files, except);
    const filePaths = filesExcept.map(f => directory + f);
    u.merge(x, {filePaths});
    
    let command = `
    browserify ${filePaths.map(f => '-r ' + f).join(' ')} > ./public/bundle.js
    `;

    u.merge(x, {command});
    execSync(command);
})
