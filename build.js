const fs = require('fs');
const path = require('path');
const u = require('wlj-utilities');

require('./library/browserify');

u.scope(__filename, context => {
    u.copyFiles('web', 'public');
});