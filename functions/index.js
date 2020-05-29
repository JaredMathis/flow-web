const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest(allowCORS(tryCatch((request, response) => {
    response.send("helloWorld: Hello from Firebase!");
})));

exports.upload = functions.https.onRequest(allowCORS(tryCatch(async (request, response) => {
    let log = true;
    
    if (log) console.log({ 'request.body': request.body });

    assert(() => request.body.values.length >= 1);

    for (let value of request.body.values) {
        assert(() => isString(value.ref));
        assert(() => isString(value.value));
    
        if (log) console.log('getting ref');
        let r = admin.database().ref("/" + value.ref);
        if (log) console.log('pushing');
        await r.push(value.value);
        if (log) console.log('pushed');
    }

    response.send({
        success: true,
    });
})));

exports.download = functions.https.onRequest(allowCORS(tryCatch(async (request, response) => {    
    console.log({'request.body.refs':request.body.refs});
    let refs = request.body.refs;
    console.log({refs});

    let values = {};

    for (let i in refs) {
        console.log({i});
        let refsI = refs[i];
        let ref = "/" + refsI;
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

        values[refsI] = last;
    }

    response.send({
        success: true,
        values,
    });
})));

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

function assert(lambda, message) {
    let log = true;
    if (log) console.log('assert: entered', { lambda });

    if (lambda()) {
        if (log) console.log('assert: passed', { lambda });
        return;
    }

    if (log) console.log('assert: failed', { lambda });
    throw { message: 'Assertion failed: ' + message };
}

function isString(s) {
    return s === s + "";
}

function allowCORS(lambda) {
    return async (request, response) => {
        response.set('Access-Control-Allow-Origin', "*")
        response.set('Access-Control-Allow-Methods', 'GET, POST')
        return await lambda(request, response);
    };
}