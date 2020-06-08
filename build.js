const fs = require('fs');
const path = require('path');
const u = require('wlj-utilities');
const { execSync } = require('child_process');

execSync('npm update');

require('./library/browserify');

u.scope(__filename, context => {
    u.copyFiles('web', 'public');
});
