const u = require('wlj-utilities');

require('./build');

const command = `aws s3 sync ./public s3://wlj-flow`;
const output = u.executeCommand(command);
console.log(output);