const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest(tryCatch((request, response) => {
    response.send("helloWorld: Hello from Firebase!");
}));

exports.upload = functions.https.onRequest(tryCatch(async (request, response) => {
    let log = true;
    
    if (log) console.log({ 'request.body': request.body });
    if (log) console.log({ 'typeof request.body.ref': typeof request.body.ref });

    assert(() => isString(request.body.ref));
    assert(() => isString(request.body.data));

    if (log) console.log('getting ref');
    let r = admin.database().ref("/" + request.body.ref);
    if (log) console.log('pushing');
    await r.push(request.body.data);
    if (log) console.log('pushed');

    response.send({
        success: true,
    });
}));

exports.download = functions.https.onRequest(tryCatch(async (request, response) => {
    assert(() => isString(request.query.ref));
    
    let ref = "/" + request.query.ref;
    console.log({ref});
    let r = admin.database().ref(ref);
    console.log('running query');
    let value = await r.once('value');
    console.log('cloning');
    let cloned = JSON.parse(JSON.stringify(value));
    console.log('Getting keys');
    let keys = Object.keys(cloned);

    console.log('Looping');
    let last;
    for (let key of keys) {
        last = cloned[key];
    }
    console.log('Looped');

    response.send({
        success: true,
        value: last,
    });
}));

function tryCatch(lambda) {
    return async (request, response) => {
        try {
            return await lambda(request, response);
        } catch (e) {
            let requestBody = request.body;
            response.send({
                success: false,
                e,
                requestBody,
            });
        }
    };
}

function assert(lambda) {
    let log = true;
    if (log) console.log('assert: entered', { lambda });

    if (lambda()) {
        if (log) console.log('assert: passed', { lambda });
        return;
    }

    if (log) console.log('assert: failed', { lambda });
    throw { message: 'Assertion failed: ' + lambda };
}

function isString(s) {
    return s === s + "";
}