require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
/**
 * A response from a web request
 */
var Response = /** @class */ (function () {
    function Response(statusCode, headers, body, url) {
        if (typeof statusCode !== 'number') {
            throw new TypeError('statusCode must be a number but was ' + typeof statusCode);
        }
        if (headers === null) {
            throw new TypeError('headers cannot be null');
        }
        if (typeof headers !== 'object') {
            throw new TypeError('headers must be an object but was ' + typeof headers);
        }
        this.statusCode = statusCode;
        var headersToLowerCase = {};
        for (var key in headers) {
            headersToLowerCase[key.toLowerCase()] = headers[key];
        }
        this.headers = headersToLowerCase;
        this.body = body;
        this.url = url;
    }
    Response.prototype.isError = function () {
        return this.statusCode === 0 || this.statusCode >= 400;
    };
    Response.prototype.getBody = function (encoding) {
        if (this.statusCode === 0) {
            var err = new Error('This request to ' +
                this.url +
                ' resulted in a status code of 0. This usually indicates some kind of network error in a browser (e.g. CORS not being set up or the DNS failing to resolve):\n' +
                this.body.toString());
            err.statusCode = this.statusCode;
            err.headers = this.headers;
            err.body = this.body;
            err.url = this.url;
            throw err;
        }
        if (this.statusCode >= 300) {
            var err = new Error('Server responded to ' +
                this.url +
                ' with status code ' +
                this.statusCode +
                ':\n' +
                this.body.toString());
            err.statusCode = this.statusCode;
            err.headers = this.headers;
            err.body = this.body;
            err.url = this.url;
            throw err;
        }
        if (!encoding || typeof this.body === 'string') {
            return this.body;
        }
        return this.body.toString(encoding);
    };
    return Response;
}());
module.exports = Response;

},{}],2:[function(require,module,exports){
'use strict';

var replace = String.prototype.replace;
var percentTwenties = /%20/g;

var util = require('./utils');

var Format = {
    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
};

module.exports = util.assign(
    {
        'default': Format.RFC3986,
        formatters: {
            RFC1738: function (value) {
                return replace.call(value, percentTwenties, '+');
            },
            RFC3986: function (value) {
                return String(value);
            }
        }
    },
    Format
);

},{"./utils":6}],3:[function(require,module,exports){
'use strict';

var stringify = require('./stringify');
var parse = require('./parse');
var formats = require('./formats');

module.exports = {
    formats: formats,
    parse: parse,
    stringify: stringify
};

},{"./formats":2,"./parse":4,"./stringify":5}],4:[function(require,module,exports){
'use strict';

var utils = require('./utils');

var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var defaults = {
    allowDots: false,
    allowPrototypes: false,
    arrayLimit: 20,
    charset: 'utf-8',
    charsetSentinel: false,
    comma: false,
    decoder: utils.decode,
    delimiter: '&',
    depth: 5,
    ignoreQueryPrefix: false,
    interpretNumericEntities: false,
    parameterLimit: 1000,
    parseArrays: true,
    plainObjects: false,
    strictNullHandling: false
};

var interpretNumericEntities = function (str) {
    return str.replace(/&#(\d+);/g, function ($0, numberStr) {
        return String.fromCharCode(parseInt(numberStr, 10));
    });
};

var parseArrayValue = function (val, options) {
    if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
        return val.split(',');
    }

    return val;
};

// This is what browsers will submit when the ✓ character occurs in an
// application/x-www-form-urlencoded body and the encoding of the page containing
// the form is iso-8859-1, or when the submitted form has an accept-charset
// attribute of iso-8859-1. Presumably also with other charsets that do not contain
// the ✓ character, such as us-ascii.
var isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')

// These are the percent-encoded utf-8 octets representing a checkmark, indicating that the request actually is utf-8 encoded.
var charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')

var parseValues = function parseQueryStringValues(str, options) {
    var obj = {};
    var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
    var limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
    var parts = cleanStr.split(options.delimiter, limit);
    var skipIndex = -1; // Keep track of where the utf8 sentinel was found
    var i;

    var charset = options.charset;
    if (options.charsetSentinel) {
        for (i = 0; i < parts.length; ++i) {
            if (parts[i].indexOf('utf8=') === 0) {
                if (parts[i] === charsetSentinel) {
                    charset = 'utf-8';
                } else if (parts[i] === isoSentinel) {
                    charset = 'iso-8859-1';
                }
                skipIndex = i;
                i = parts.length; // The eslint settings do not allow break;
            }
        }
    }

    for (i = 0; i < parts.length; ++i) {
        if (i === skipIndex) {
            continue;
        }
        var part = parts[i];

        var bracketEqualsPos = part.indexOf(']=');
        var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

        var key, val;
        if (pos === -1) {
            key = options.decoder(part, defaults.decoder, charset, 'key');
            val = options.strictNullHandling ? null : '';
        } else {
            key = options.decoder(part.slice(0, pos), defaults.decoder, charset, 'key');
            val = utils.maybeMap(
                parseArrayValue(part.slice(pos + 1), options),
                function (encodedVal) {
                    return options.decoder(encodedVal, defaults.decoder, charset, 'value');
                }
            );
        }

        if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
            val = interpretNumericEntities(val);
        }

        if (part.indexOf('[]=') > -1) {
            val = isArray(val) ? [val] : val;
        }

        if (has.call(obj, key)) {
            obj[key] = utils.combine(obj[key], val);
        } else {
            obj[key] = val;
        }
    }

    return obj;
};

var parseObject = function (chain, val, options, valuesParsed) {
    var leaf = valuesParsed ? val : parseArrayValue(val, options);

    for (var i = chain.length - 1; i >= 0; --i) {
        var obj;
        var root = chain[i];

        if (root === '[]' && options.parseArrays) {
            obj = [].concat(leaf);
        } else {
            obj = options.plainObjects ? Object.create(null) : {};
            var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
            var index = parseInt(cleanRoot, 10);
            if (!options.parseArrays && cleanRoot === '') {
                obj = { 0: leaf };
            } else if (
                !isNaN(index)
                && root !== cleanRoot
                && String(index) === cleanRoot
                && index >= 0
                && (options.parseArrays && index <= options.arrayLimit)
            ) {
                obj = [];
                obj[index] = leaf;
            } else {
                obj[cleanRoot] = leaf;
            }
        }

        leaf = obj; // eslint-disable-line no-param-reassign
    }

    return leaf;
};

var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
    if (!givenKey) {
        return;
    }

    // Transform dot notation to bracket notation
    var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

    // The regex chunks

    var brackets = /(\[[^[\]]*])/;
    var child = /(\[[^[\]]*])/g;

    // Get the parent

    var segment = options.depth > 0 && brackets.exec(key);
    var parent = segment ? key.slice(0, segment.index) : key;

    // Stash the parent if it exists

    var keys = [];
    if (parent) {
        // If we aren't using plain objects, optionally prefix keys that would overwrite object prototype properties
        if (!options.plainObjects && has.call(Object.prototype, parent)) {
            if (!options.allowPrototypes) {
                return;
            }
        }

        keys.push(parent);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while (options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth) {
        i += 1;
        if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
            if (!options.allowPrototypes) {
                return;
            }
        }
        keys.push(segment[1]);
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return parseObject(keys, val, options, valuesParsed);
};

var normalizeParseOptions = function normalizeParseOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (opts.decoder !== null && opts.decoder !== undefined && typeof opts.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.');
    }

    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }
    var charset = typeof opts.charset === 'undefined' ? defaults.charset : opts.charset;

    return {
        allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
        allowPrototypes: typeof opts.allowPrototypes === 'boolean' ? opts.allowPrototypes : defaults.allowPrototypes,
        arrayLimit: typeof opts.arrayLimit === 'number' ? opts.arrayLimit : defaults.arrayLimit,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        comma: typeof opts.comma === 'boolean' ? opts.comma : defaults.comma,
        decoder: typeof opts.decoder === 'function' ? opts.decoder : defaults.decoder,
        delimiter: typeof opts.delimiter === 'string' || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
        // eslint-disable-next-line no-implicit-coercion, no-extra-parens
        depth: (typeof opts.depth === 'number' || opts.depth === false) ? +opts.depth : defaults.depth,
        ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
        interpretNumericEntities: typeof opts.interpretNumericEntities === 'boolean' ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
        parameterLimit: typeof opts.parameterLimit === 'number' ? opts.parameterLimit : defaults.parameterLimit,
        parseArrays: opts.parseArrays !== false,
        plainObjects: typeof opts.plainObjects === 'boolean' ? opts.plainObjects : defaults.plainObjects,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
    };
};

module.exports = function (str, opts) {
    var options = normalizeParseOptions(opts);

    if (str === '' || str === null || typeof str === 'undefined') {
        return options.plainObjects ? Object.create(null) : {};
    }

    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
    var obj = options.plainObjects ? Object.create(null) : {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options, typeof str === 'string');
        obj = utils.merge(obj, newObj, options);
    }

    return utils.compact(obj);
};

},{"./utils":6}],5:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var formats = require('./formats');
var has = Object.prototype.hasOwnProperty;

var arrayPrefixGenerators = {
    brackets: function brackets(prefix) {
        return prefix + '[]';
    },
    comma: 'comma',
    indices: function indices(prefix, key) {
        return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) {
        return prefix;
    }
};

var isArray = Array.isArray;
var push = Array.prototype.push;
var pushToArray = function (arr, valueOrArray) {
    push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
};

var toISO = Date.prototype.toISOString;

var defaultFormat = formats['default'];
var defaults = {
    addQueryPrefix: false,
    allowDots: false,
    charset: 'utf-8',
    charsetSentinel: false,
    delimiter: '&',
    encode: true,
    encoder: utils.encode,
    encodeValuesOnly: false,
    format: defaultFormat,
    formatter: formats.formatters[defaultFormat],
    // deprecated
    indices: false,
    serializeDate: function serializeDate(date) {
        return toISO.call(date);
    },
    skipNulls: false,
    strictNullHandling: false
};

var isNonNullishPrimitive = function isNonNullishPrimitive(v) {
    return typeof v === 'string'
        || typeof v === 'number'
        || typeof v === 'boolean'
        || typeof v === 'symbol'
        || typeof v === 'bigint';
};

var stringify = function stringify(
    object,
    prefix,
    generateArrayPrefix,
    strictNullHandling,
    skipNulls,
    encoder,
    filter,
    sort,
    allowDots,
    serializeDate,
    formatter,
    encodeValuesOnly,
    charset
) {
    var obj = object;
    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (obj instanceof Date) {
        obj = serializeDate(obj);
    } else if (generateArrayPrefix === 'comma' && isArray(obj)) {
        obj = utils.maybeMap(obj, function (value) {
            if (value instanceof Date) {
                return serializeDate(value);
            }
            return value;
        }).join(',');
    }

    if (obj === null) {
        if (strictNullHandling) {
            return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, 'key') : prefix;
        }

        obj = '';
    }

    if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
        if (encoder) {
            var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, 'key');
            return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder, charset, 'value'))];
        }
        return [formatter(prefix) + '=' + formatter(String(obj))];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (isArray(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];
        var value = obj[key];

        if (skipNulls && value === null) {
            continue;
        }

        var keyPrefix = isArray(obj)
            ? typeof generateArrayPrefix === 'function' ? generateArrayPrefix(prefix, key) : prefix
            : prefix + (allowDots ? '.' + key : '[' + key + ']');

        pushToArray(values, stringify(
            value,
            keyPrefix,
            generateArrayPrefix,
            strictNullHandling,
            skipNulls,
            encoder,
            filter,
            sort,
            allowDots,
            serializeDate,
            formatter,
            encodeValuesOnly,
            charset
        ));
    }

    return values;
};

var normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (opts.encoder !== null && opts.encoder !== undefined && typeof opts.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    var charset = opts.charset || defaults.charset;
    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }

    var format = formats['default'];
    if (typeof opts.format !== 'undefined') {
        if (!has.call(formats.formatters, opts.format)) {
            throw new TypeError('Unknown format option provided.');
        }
        format = opts.format;
    }
    var formatter = formats.formatters[format];

    var filter = defaults.filter;
    if (typeof opts.filter === 'function' || isArray(opts.filter)) {
        filter = opts.filter;
    }

    return {
        addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults.addQueryPrefix,
        allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        delimiter: typeof opts.delimiter === 'undefined' ? defaults.delimiter : opts.delimiter,
        encode: typeof opts.encode === 'boolean' ? opts.encode : defaults.encode,
        encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults.encoder,
        encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
        filter: filter,
        formatter: formatter,
        serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults.serializeDate,
        skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults.skipNulls,
        sort: typeof opts.sort === 'function' ? opts.sort : null,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
    };
};

module.exports = function (object, opts) {
    var obj = object;
    var options = normalizeStringifyOptions(opts);

    var objKeys;
    var filter;

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }

    var keys = [];

    if (typeof obj !== 'object' || obj === null) {
        return '';
    }

    var arrayFormat;
    if (opts && opts.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = opts.arrayFormat;
    } else if (opts && 'indices' in opts) {
        arrayFormat = opts.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (options.sort) {
        objKeys.sort(options.sort);
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (options.skipNulls && obj[key] === null) {
            continue;
        }
        pushToArray(keys, stringify(
            obj[key],
            key,
            generateArrayPrefix,
            options.strictNullHandling,
            options.skipNulls,
            options.encode ? options.encoder : null,
            options.filter,
            options.sort,
            options.allowDots,
            options.serializeDate,
            options.formatter,
            options.encodeValuesOnly,
            options.charset
        ));
    }

    var joined = keys.join(options.delimiter);
    var prefix = options.addQueryPrefix === true ? '?' : '';

    if (options.charsetSentinel) {
        if (options.charset === 'iso-8859-1') {
            // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
            prefix += 'utf8=%26%2310003%3B&';
        } else {
            // encodeURIComponent('✓')
            prefix += 'utf8=%E2%9C%93&';
        }
    }

    return joined.length > 0 ? prefix + joined : '';
};

},{"./formats":2,"./utils":6}],6:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var hexTable = (function () {
    var array = [];
    for (var i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }

    return array;
}());

var compactQueue = function compactQueue(queue) {
    while (queue.length > 1) {
        var item = queue.pop();
        var obj = item.obj[item.prop];

        if (isArray(obj)) {
            var compacted = [];

            for (var j = 0; j < obj.length; ++j) {
                if (typeof obj[j] !== 'undefined') {
                    compacted.push(obj[j]);
                }
            }

            item.obj[item.prop] = compacted;
        }
    }
};

var arrayToObject = function arrayToObject(source, options) {
    var obj = options && options.plainObjects ? Object.create(null) : {};
    for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }

    return obj;
};

var merge = function merge(target, source, options) {
    /* eslint no-param-reassign: 0 */
    if (!source) {
        return target;
    }

    if (typeof source !== 'object') {
        if (isArray(target)) {
            target.push(source);
        } else if (target && typeof target === 'object') {
            if ((options && (options.plainObjects || options.allowPrototypes)) || !has.call(Object.prototype, source)) {
                target[source] = true;
            }
        } else {
            return [target, source];
        }

        return target;
    }

    if (!target || typeof target !== 'object') {
        return [target].concat(source);
    }

    var mergeTarget = target;
    if (isArray(target) && !isArray(source)) {
        mergeTarget = arrayToObject(target, options);
    }

    if (isArray(target) && isArray(source)) {
        source.forEach(function (item, i) {
            if (has.call(target, i)) {
                var targetItem = target[i];
                if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
                    target[i] = merge(targetItem, item, options);
                } else {
                    target.push(item);
                }
            } else {
                target[i] = item;
            }
        });
        return target;
    }

    return Object.keys(source).reduce(function (acc, key) {
        var value = source[key];

        if (has.call(acc, key)) {
            acc[key] = merge(acc[key], value, options);
        } else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
};

var assign = function assignSingleSource(target, source) {
    return Object.keys(source).reduce(function (acc, key) {
        acc[key] = source[key];
        return acc;
    }, target);
};

var decode = function (str, decoder, charset) {
    var strWithoutPlus = str.replace(/\+/g, ' ');
    if (charset === 'iso-8859-1') {
        // unescape never throws, no try...catch needed:
        return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
    }
    // utf-8
    try {
        return decodeURIComponent(strWithoutPlus);
    } catch (e) {
        return strWithoutPlus;
    }
};

var encode = function encode(str, defaultEncoder, charset) {
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }

    var string = str;
    if (typeof str === 'symbol') {
        string = Symbol.prototype.toString.call(str);
    } else if (typeof str !== 'string') {
        string = String(str);
    }

    if (charset === 'iso-8859-1') {
        return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
            return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
        });
    }

    var out = '';
    for (var i = 0; i < string.length; ++i) {
        var c = string.charCodeAt(i);

        if (
            c === 0x2D // -
            || c === 0x2E // .
            || c === 0x5F // _
            || c === 0x7E // ~
            || (c >= 0x30 && c <= 0x39) // 0-9
            || (c >= 0x41 && c <= 0x5A) // a-z
            || (c >= 0x61 && c <= 0x7A) // A-Z
        ) {
            out += string.charAt(i);
            continue;
        }

        if (c < 0x80) {
            out = out + hexTable[c];
            continue;
        }

        if (c < 0x800) {
            out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        if (c < 0xD800 || c >= 0xE000) {
            out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        i += 1;
        c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
        out += hexTable[0xF0 | (c >> 18)]
            + hexTable[0x80 | ((c >> 12) & 0x3F)]
            + hexTable[0x80 | ((c >> 6) & 0x3F)]
            + hexTable[0x80 | (c & 0x3F)];
    }

    return out;
};

var compact = function compact(value) {
    var queue = [{ obj: { o: value }, prop: 'o' }];
    var refs = [];

    for (var i = 0; i < queue.length; ++i) {
        var item = queue[i];
        var obj = item.obj[item.prop];

        var keys = Object.keys(obj);
        for (var j = 0; j < keys.length; ++j) {
            var key = keys[j];
            var val = obj[key];
            if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
                queue.push({ obj: obj, prop: key });
                refs.push(val);
            }
        }
    }

    compactQueue(queue);

    return value;
};

var isRegExp = function isRegExp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

var isBuffer = function isBuffer(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }

    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};

var combine = function combine(a, b) {
    return [].concat(a, b);
};

var maybeMap = function maybeMap(val, fn) {
    if (isArray(val)) {
        var mapped = [];
        for (var i = 0; i < val.length; i += 1) {
            mapped.push(fn(val[i]));
        }
        return mapped;
    }
    return fn(val);
};

module.exports = {
    arrayToObject: arrayToObject,
    assign: assign,
    combine: combine,
    compact: compact,
    decode: decode,
    encode: encode,
    isBuffer: isBuffer,
    isRegExp: isRegExp,
    maybeMap: maybeMap,
    merge: merge
};

},{}],7:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var handle_qs_js_1 = require("then-request/lib/handle-qs.js");
var GenericResponse = require("http-response-object");
var fd = FormData;
exports.FormData = fd;
function doRequest(method, url, options) {
    var xhr = new XMLHttpRequest();
    // check types of arguments
    if (typeof method !== 'string') {
        throw new TypeError('The method must be a string.');
    }
    if (url && typeof url === 'object') {
        url = url.href;
    }
    if (typeof url !== 'string') {
        throw new TypeError('The URL/path must be a string.');
    }
    if (options === null || options === undefined) {
        options = {};
    }
    if (typeof options !== 'object') {
        throw new TypeError('Options must be an object (or null).');
    }
    method = method.toUpperCase();
    options.headers = options.headers || {};
    // handle cross domain
    var match;
    var crossDomain = !!((match = /^([\w-]+:)?\/\/([^\/]+)/.exec(url)) && match[2] != location.host);
    if (!crossDomain)
        options.headers['X-Requested-With'] = 'XMLHttpRequest';
    // handle query string
    if (options.qs) {
        url = handle_qs_js_1["default"](url, options.qs);
    }
    // handle json body
    if (options.json) {
        options.body = JSON.stringify(options.json);
        options.headers['content-type'] = 'application/json';
    }
    if (options.form) {
        options.body = options.form;
    }
    // method, url, async
    xhr.open(method, url, false);
    for (var name in options.headers) {
        xhr.setRequestHeader(name.toLowerCase(), '' + options.headers[name]);
    }
    // avoid sending empty string (#319)
    xhr.send(options.body ? options.body : null);
    var headers = {};
    xhr
        .getAllResponseHeaders()
        .split('\r\n')
        .forEach(function (header) {
        var h = header.split(':');
        if (h.length > 1) {
            headers[h[0].toLowerCase()] = h
                .slice(1)
                .join(':')
                .trim();
        }
    });
    return new GenericResponse(xhr.status, headers, xhr.responseText, url);
}
exports["default"] = doRequest;
module.exports = doRequest;
module.exports["default"] = doRequest;
module.exports.FormData = fd;

},{"http-response-object":1,"then-request/lib/handle-qs.js":8}],8:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var qs_1 = require("qs");
function handleQs(url, query) {
    var _a = url.split('?'), start = _a[0], part2 = _a[1];
    var qs = (part2 || '').split('#')[0];
    var end = part2 && part2.split('#').length > 1 ? '#' + part2.split('#')[1] : '';
    var baseQs = qs_1.parse(qs);
    for (var i in query) {
        baseQs[i] = query[i];
    }
    qs = qs_1.stringify(baseQs);
    if (qs !== '') {
        qs = '?' + qs;
    }
    return start + qs + end;
}
exports["default"] = handleQs;

},{"qs":3}],9:[function(require,module,exports){
module.exports = {};
module.exports.getTypesPath = require("./library/getTypesPath.js");
module.exports.add = require("./library/defineAdd.js");
module.exports.defineFunction = require("./library/defineFunction.js");
module.exports.variable = require("./library/variable.js");
module.exports.assertIsValidType = require("./library/assertIsValidType.js");
module.exports.type = require("./library/type.js");
module.exports.evaluate = require("./library/evaluate.js");
module.exports.getTypes = require("./library/getTypes.js");
module.exports.compile = require("./library/compile.js");
module.exports.assertIsFunction = require("./library/assertIsFunction.js");
module.exports.assertIsFunctionName = require("./library/assertIsFunctionName.js");
module.exports.compileAssertIsType = require("./library/compileAssertIsType.js");
module.exports.package = require("./library/package.js");
module.exports.defineSum = require("./library/defineSum.js");
module.exports.typeInt = require("./library/typeInt.js");
module.exports.typeList = require("./library/typeList.js");
module.exports.steps = require("./library/steps.js");
module.exports.set = require("./library/set.js");
module.exports.newInt = require("./library/newInt.js");
module.exports.loop = require("./library/loop.js");
module.exports.execute = require("./library/execute.js");
module.exports.getRoots = require("./library/getRoots.js");
module.exports.compileAssertHasOwnProperty = require("./library/compileAssertHasOwnProperty.js");
module.exports.defineCount = require("./library/defineCount.js");
module.exports.defineAverage = require("./library/defineAverage.js");
module.exports.block = require("./library/block.js");
module.exports.getLibrary = require("./library/getLibrary.js");
module.exports.defineDivide = require("./library/defineDivide.js");
module.exports.ifElse = require("./library/ifElse.js");
},{"./library/assertIsFunction.js":10,"./library/assertIsFunctionName.js":11,"./library/assertIsValidType.js":12,"./library/block.js":13,"./library/compile.js":14,"./library/compileAssertHasOwnProperty.js":15,"./library/compileAssertIsType.js":16,"./library/defineAdd.js":17,"./library/defineAverage.js":18,"./library/defineCount.js":19,"./library/defineDivide.js":20,"./library/defineFunction.js":21,"./library/defineSum.js":22,"./library/evaluate.js":23,"./library/execute.js":24,"./library/getLibrary.js":25,"./library/getRoots.js":26,"./library/getTypes.js":27,"./library/getTypesPath.js":28,"./library/ifElse.js":29,"./library/loop.js":30,"./library/newInt.js":31,"./library/package.js":32,"./library/set.js":33,"./library/steps.js":34,"./library/type.js":35,"./library/typeInt.js":36,"./library/typeList.js":37,"./library/variable.js":38}],10:[function(require,module,exports){

const u = require("wlj-utilities");

const assertIsFunctionName = require("./assertIsFunctionName");

module.exports = assertIsFunction;

function assertIsFunction(fn) {
    let result;
    u.scope(assertIsFunction.name, x => {
        u.merge(x, {fn});

        u.assert(() => u.isDefined(fn));

        assertIsFunctionName(fn.name);
        
        u.assert(() => u.isArray(fn.inputs));
        // TODO: assert each input

        u.assert(() => u.isArray(fn.outputs));
        // TODO: assert each output

        u.assert(() => u.isDefined(fn.root));
        // TODO: do a more thorough assert on the root
    });
    return result;
}

},{"./assertIsFunctionName":11,"wlj-utilities":44}],11:[function(require,module,exports){

const u = require("wlj-utilities");

module.exports = assertIsFunctionName;

function assertIsFunctionName() {
    let result;
    u.scope(assertIsFunctionName.name, x => {

    });
    return result;
}

},{"wlj-utilities":44}],12:[function(require,module,exports){

const u = require("wlj-utilities");

module.exports = assertIsValidType;

function assertIsValidType(type, types) {
    let result;
    u.scope(assertIsValidType.name, x => {
        u.merge(x,{type})
        u.merge(x,{types})
        u.assert(() => u.isString(type));
        u.assert(() => u.isArray(types));
        u.assert(() => types.includes(type));
    });
    return result;
}

},{"wlj-utilities":44}],13:[function(require,module,exports){

const u = require("wlj-utilities");

module.exports = block;

function block(variables, root) {
    let result;
    u.scope(block.name, x => {
        u.assert(() => u.isArray(variables));
        u.assert(() => variables.length >= 1);
        u.assert(() => u.isDefined(root));

        result = {
            $type: 'block',
            variables,
            root,
        }
    });
    return result;
}

},{"wlj-utilities":44}],14:[function(require,module,exports){

const u = require("wlj-utilities");
const getRoots = require("./getRoots");

module.exports = compile;

const tab = '  ';

function compile(f, fns) {
    let result;
    u.scope(compile.name, x => {
        u.merge(x,{f,fns});

        u.assert(() => u.isDefined(f));
        u.merge(x,() => f.name);
        delete x.f;
        u.assert(() => f.$type === 'defineFunction');
        u.assert(() => u.isArray(fns));
        u.merge(x,() => fns.map(f => f.name));
        delete x.fns;

        let indent = tab;

        result = [];

        result.push(`function ${f.name}(inputs) {`);
        result.push(`${indent}// Initialize output`);
        result.push(`${indent}const outputs = {};`);
        result.push(`${indent}u.scope(${f.name}.name, $context => {`);
        result.push(`${indent}u.merge($context, {inputs});`);

        result.push(`${indent}// Validate input properties`);
        u.loop(f.inputs, i => {
            result.push(`${indent}compileAssertHasOwnProperty(inputs, "${i.name}");`);
        });
        result.push(`${indent}// Set input variables`);
        u.loop(f.inputs, i => {
            result.push(`${indent}const ${i.name} = inputs["${i.name}"];`);
        });
        result.push(`${indent}// Validate input types`);
        u.loop(f.inputs, i => {
            result.push(`${indent}compileAssertIsType(${i.name}, ${JSON.stringify(i.type)});`);
        });
        result.push(`${indent}// Initialize outputs`);
        u.loop(f.outputs, o => {
            result.push(`${indent}let ${o.name} = null;`);
        });

        result.push(`${indent}// Root ${f.name}`);
        processRoot(f.root, result, indent, fns);
        
        result.push(`${indent}// Set output`);
        u.loop(f.outputs, o => {
            result.push(`${indent}outputs["${o.name}"] = ${o.name};`);
        });
        result.push(`${indent}u.merge($context, {outputs});`);
        u.loop(f.outputs, o => {
            result.push(`${indent}compileAssertIsType(${o.name}, ${JSON.stringify(o.type)});`);
        });

        result.push(`${indent}});`);
        result.push(`${indent}return outputs;`);
        result.push(`}`);
    });
    return result;
}

function processRoot(root, lines, indent, fns) {
    let result;
    u.scope(processRoot.name, x => {
        //u.merge(x, {root, lines, indent, fns});

        u.assert(() => u.isDefined(root));
        u.assertIsStringArray(lines);
        u.assert(() => u.isString(indent));
        u.assert(() => u.isArray(fns));

        let fnsNames = fns.map(f => f.name);
        u.merge(x,{fnsNames});

        let types = {
            block: () => {
                lines.push(`${indent}// Block`);
                lines.push(`${indent}(function () {`);
                u.loop(root.variables, v => {
                    u.assert(() => u.isString(v.name));
                    u.assert(() => !fnsNames.includes(v.name));

                    // Variables can be assigned to; needs to be let not const
                    lines.push(`${indent}${tab}let ${v.name} = null;`);
                });
                processRoot(root.root, lines, indent + tab, fns);
                lines.push(`${indent}})();`);
            },
            evaluate: () => lines.push(`${indent}eval("${root.expression}")`),
            execute: () => {
                u.merge(x, ()=>root.inputs);
                u.merge(x, ()=>root.outputs);
                let definition = u.arraySingle(fns, { name: root.name });

                lines.push(`${indent}// Execute ${root.name}`);
                lines.push(`${indent}(function () {`);
                lines.push(`${indent}${tab}const executeInputs = {};`);
                u.loop(definition.inputs, input => {
                    let inputName = input.name;
                    u.merge(x, {inputName});
                    u.assert(() => !fnsNames.includes(inputName));
                    let mappedInput = root.inputs[inputName];
                    u.merge(x, {mappedInput});
                    u.assert(() => u.isString(mappedInput));
                    lines.push(`${indent}${tab}executeInputs["${input.name}"] = ${mappedInput};`);
                });
                lines.push(`${indent}${tab}const executeOutputs = ${root.name}(executeInputs);`);
                let outputNames = definition.outputs.map(o => o.name);
                u.merge(x,{outputNames});
                u.assert(() => u.isSetEqual(outputNames, Object.keys(root.outputs)));
                u.loop(definition.outputs, output => {
                    let outputName = output.name;
                    u.merge(x, {outputName});
                    u.assert(() => !fnsNames.includes(outputName));
                    let mappedOutput = root.outputs[outputName];
                    u.merge(x, {mappedOutput});
                    u.assert(() => u.isString(mappedOutput));
                    lines.push(`${indent}${tab}${mappedOutput} = executeOutputs["${output.name}"];`);
                });
                lines.push(`${indent}})();`);
            },
            loop: () => {
                lines.push(`${indent}let ${root.index} = 0;`);
                lines.push(`${indent}for (const ${root.element} of ${root.array}) {`);
                processRoot(root.root, lines, indent + tab, fns);
                
                lines.push(`${indent+tab}${root.index}++;`);
                lines.push(`${indent}}`)
            },
            set: () => {
                u.assert(() => u.isDefined(root.right));
                u.assert(() => root.right.$type === 'newInt');
                let right = root.right.value;
                lines.push(`${indent}${root.left} = ${right};`);
            },
            steps: () => {
                lines.push(`${indent}// Steps`);                
                u.loop(root.steps, step => {
                    u.merge(x, {step})
                    processRoot(step, lines, indent + tab, fns);
                });
            },
        };

        let typeKeys = Object.keys(types);
        u.merge(x, {typeKeys});

        const roots = getRoots();
        u.merge(x, {roots});
        
        u.assert(() => u.isSetEqual(roots, typeKeys));

        let rootType = root.$type;
        u.merge(x, {rootType});

        u.assert(() => roots.includes(rootType));

        types[rootType]();
    });
    return result;
}
},{"./getRoots":26,"wlj-utilities":44}],15:[function(require,module,exports){

const u = require("wlj-utilities");

module.exports = compileAssertHasOwnProperty;

function compileAssertHasOwnProperty(object, property) {
    let result;
    u.scope(compileAssertHasOwnProperty.name, x => {
        u.merge(x,{object});
        u.merge(x,{property});

        u.assert(() => u.isString(property));
        u.assert(() => object.hasOwnProperty(property));
    });
    return result;
}

},{"wlj-utilities":44}],16:[function(require,module,exports){

const u = require("wlj-utilities");

module.exports = compileAssertIsType;

function compileAssertIsType(value, type) {
    let result;
    u.scope(compileAssertIsType.name, x => {
        u.merge(x,{value});
        u.merge(x,{type});

        u.assert(() => u.isDefined(value));
        u.assert(() => u.isDefined(type));
        u.assert(() => u.isDefined(type.$type));

        if (type.$type === 'typeInt') {
            u.assert(() => u.isInteger(value));
            return;
        }
        
        if (type.$type === 'char') {
            u.assert(() => u.isString(value));
            u.assert(() => value.length === 1);
            return;
        }

        if (type.$type === 'typeList') {
            u.assert(() => u.isArray(value));

            return;
        }
        u.assert(() => false);
    });
    return result;
}

},{"wlj-utilities":44}],17:[function(require,module,exports){

const u = require("wlj-utilities");

const defineFunction = require("./defineFunction");
const variable = require("./variable");
const typeInt = require("./typeInt");
const evaluate = require("./evaluate");

module.exports = defineAdd;

function defineAdd() {
    let result;
    u.scope(defineAdd.name, x => {        
        result = defineFunction(
            'add', 
            [
                variable('x', typeInt()),
                variable('y', typeInt()),
            ],
            [
                variable('result', typeInt()),
            ],
            evaluate('result=x+y')
        );
    });
    return result;
}

},{"./defineFunction":21,"./evaluate":23,"./typeInt":36,"./variable":38,"wlj-utilities":44}],18:[function(require,module,exports){

const u = require("wlj-utilities");

const defineFunction = require("./defineFunction");
const variable = require("./variable");
const typeInt = require("./typeInt");
const typeList = require("./typeList");
const steps = require("./steps");
const set = require("./set");
const newInt = require("./newInt");
const loop = require("./loop");
const execute = require("./execute");
const block = require("./block");

module.exports = defineAverage;

function defineAverage() {
    let result;
    u.scope(defineAverage.name, x => {    
        result = defineFunction(
            'average', 
            [
                variable('array', typeList(typeInt())),
            ],
            [
                variable('result', typeInt()),
            ],
            block(
                [
                    variable('s', typeInt()),
                    variable('c', typeInt()),
                ],
                steps([
                    execute('sum', 
                        {'array':'array'},
                        {'result':'s'}
                    ),
                    execute('count', 
                        {'array':'array'},
                        {'result':'c'}
                    ),
                    execute('divide', 
                        {'x':'s','y':'c'},
                        {'result':'result'}
                    ),
                ]),
            ),
        );
    });
    return result;
}

},{"./block":13,"./defineFunction":21,"./execute":24,"./loop":30,"./newInt":31,"./set":33,"./steps":34,"./typeInt":36,"./typeList":37,"./variable":38,"wlj-utilities":44}],19:[function(require,module,exports){

const u = require("wlj-utilities");

const defineFunction = require("./defineFunction");
const variable = require("./variable");
const typeInt = require("./typeInt");
const typeList = require("./typeList");
const steps = require("./steps");
const set = require("./set");
const newInt = require("./newInt");
const loop = require("./loop");
const execute = require("./execute");

module.exports = defineCount;

function defineCount() {
    let result;
    u.scope(defineCount.name, x => {    
        result = defineFunction(
            'count', 
            [
                variable('array', typeList(typeInt())),
            ],
            [
                variable('result', typeInt()),
            ],
            steps([
                set('result', newInt('0')),
                set('one', newInt('1')),
                loop('array', 'a', 'index',
                    execute('add', 
                        {'x':'result', 'y':'one'},
                        {'result':'result'}),
                    )
            ]),
        );
    });
    return result;
}

},{"./defineFunction":21,"./execute":24,"./loop":30,"./newInt":31,"./set":33,"./steps":34,"./typeInt":36,"./typeList":37,"./variable":38,"wlj-utilities":44}],20:[function(require,module,exports){

const u = require("wlj-utilities");

const defineFunction = require("./defineFunction");
const variable = require("./variable");
const typeInt = require("./typeInt");
const evaluate = require("./evaluate");

module.exports = defineDivide;

function defineDivide() {
    let result;
    u.scope(defineDivide.name, x => {        
        result = defineFunction(
            'divide', 
            [
                variable('x', typeInt()),
                variable('y', typeInt()),
            ],
            [
                variable('result', typeInt()),
            ],
            evaluate('result=Math.floor(x/y);')
        );
    });
    return result;
}

},{"./defineFunction":21,"./evaluate":23,"./typeInt":36,"./variable":38,"wlj-utilities":44}],21:[function(require,module,exports){

const u = require("wlj-utilities");

const assertIsFunction = require("./assertIsFunction");
const assertIsFunctionName = require("./assertIsFunctionName");

module.exports = defineFunction;

function defineFunction(name, inputs, outputs, root) {
    let result;
    u.scope(defineFunction.name, x => {
        // TODO: Ensure multiple functions with the same
        // name are not defined. 
        // Probably not in this function.

        u.merge(x,{name});
        u.merge(x,{inputs});
        u.merge(x,{outputs});
        u.merge(x,{root});
        
        assertIsFunctionName(name);
        u.assert(() => u.isArray(inputs));
        u.assert(() => u.isArray(outputs));
        u.assert(() => u.isDefined(root));

        let inputNames = inputs.map(i => i.name);
        u.merge(x, {inputNames});
        u.assert(() => !inputNames.includes(name));
        u.assert(() => !u.arrayContainsDuplicates(inputNames));

        let outputNames = outputs.map(i => i.name);
        u.assert(() => !outputNames.includes(name));
        u.merge(x, {outputNames});
        u.assert(() => !u.arrayContainsDuplicates(outputNames));

        result = {
            $type: 'defineFunction',
            name,
            inputs,
            outputs,
            root,
        };

        assertIsFunction(result);
    });
    return result;
}

},{"./assertIsFunction":10,"./assertIsFunctionName":11,"wlj-utilities":44}],22:[function(require,module,exports){

const u = require("wlj-utilities");
const defineFunction = require("./defineFunction");
const variable = require("./variable");
const typeList = require("./typeList");
const typeInt = require("./typeInt");
const steps = require("./steps");
const set = require("./set");
const newInt = require("./newInt");
const loop = require("./loop");
const execute = require("./execute");

module.exports = defineSum;

function defineSum() {
    let result;
    u.scope(defineSum.name, x => {        
        result = defineFunction(
            'sum', 
            [
                variable('array', typeList(typeInt())),
            ],
            [
                variable('result', typeInt()),
            ],
            steps([
                set('result', newInt('0')),
                loop('array', 'a', 'index',
                    execute('add', 
                        {'x':'result', 'y':'a'},
                        {'result':'result'}),
                    )
            ]),
        );
    });
    return result;
}

},{"./defineFunction":21,"./execute":24,"./loop":30,"./newInt":31,"./set":33,"./steps":34,"./typeInt":36,"./typeList":37,"./variable":38,"wlj-utilities":44}],23:[function(require,module,exports){

const u = require("wlj-utilities");

module.exports = evaluate;

function evaluate(expression) {
    let result;
    u.scope(evaluate.name, x => {
        u.assert(() => u.isString(expression));
        result = {
            $type: 'evaluate',
            expression,
        }
    });
    return result;
}

},{"wlj-utilities":44}],24:[function(require,module,exports){

const u = require("wlj-utilities");

module.exports = execute;

function execute(name, inputs, outputs) {
    let args = arguments;
    let result;
    u.scope(execute.name, x => {
        u.merge(x,{name, inputs, outputs})
        u.assert(() => args.length === 3);
        u.assert(() => u.isString(name));
        u.assert(() => u.isDefined(inputs));
        u.assert(() => u.isDefined(outputs));

        result = {
            $type: 'execute',
            name,
            inputs,
            outputs,
        }
    });
    return result;
}

},{"wlj-utilities":44}],25:[function(require,module,exports){

const u = require("wlj-utilities");
const defineAdd = require("./defineAdd");
const defineCount = require("./defineCount");
const defineSum = require("./defineSum");
const defineAverage = require("./defineAverage");
const defineDivide = require("./defineDivide");

module.exports = getLibrary;

function getLibrary() {
    let result;
    u.scope(getLibrary.name, x => {
        result = [
            defineAdd(),
            defineDivide(),
            defineCount(),
            defineSum(),
            defineAverage(),
        ];
    });
    return result;
}

},{"./defineAdd":17,"./defineAverage":18,"./defineCount":19,"./defineDivide":20,"./defineSum":22,"wlj-utilities":44}],26:[function(require,module,exports){

const u = require("wlj-utilities");

module.exports = getRoots;

/**
 * Returns the different root statements that need handling.
 */
function getRoots() {
    let result;
    u.scope(getRoots.name, x => {
        result = [
            'block',
            'evaluate',
            'execute',
            'loop',
            'set',
            'steps',
        ]
    });
    return result;
}

},{"wlj-utilities":44}],27:[function(require,module,exports){

const u = require("wlj-utilities");
const getTypesPath = require("./getTypesPath");

module.exports = getTypes;

function getTypes() {
    let result;
    u.scope(getTypes.name, x => {
        let path = getTypesPath();
        u.merge(x,{path});
        let json = u.readFile(path);
        u.merge(x,{json});
        let parsed = JSON.parse(json);
        result = parsed;
    });
    return result;
}

},{"./getTypesPath":28,"wlj-utilities":44}],28:[function(require,module,exports){

const u = require("wlj-utilities");

module.exports = getTypesPath;

function getTypesPath() {
    let result;
    u.scope(getTypesPath.name, x => {
        result = './types.json';
    });
    return result;
}

},{"wlj-utilities":44}],29:[function(require,module,exports){

const u = require("wlj-utilities");

module.exports = ifElse;

function ifElse() {
    let result;
    u.scope(ifElse.name, x => {
        // TODO
    });
    return result;
}

},{"wlj-utilities":44}],30:[function(require,module,exports){

const u = require("wlj-utilities");

module.exports = loop;

function loop(array, element, index, root) {
    let result;
    u.scope(loop.name, x => {
        u.merge(x,{array,element,index,root});

        u.assert(() => u.isString(array));
        u.assert(() => u.isString(element));
        u.assert(() => u.isString(index));
        u.assert(() => u.isDefined(root));

        result = {
            $type: 'loop',
            array,
            element,
            index,
            root,
        }
    });
    return result;
}

},{"wlj-utilities":44}],31:[function(require,module,exports){

const u = require("wlj-utilities");

module.exports = newInt;

function newInt(value) {
    let result;
    u.scope(newInt.name, x => {
        u.merge(x, {value});
        u.assert(() => u.isString(value));

        let i = parseInt(value, 10);
        u.merge(x, {i});
        u.assert(() => u.isInteger(i));
        
        result = {
            $type: 'newInt',
            value: i,
        };
    });
    return result;
}

},{"wlj-utilities":44}],32:[function(require,module,exports){

const u = require("wlj-utilities");

module.exports = package;

function package() {
    let result;
    u.scope(package.name, x => {
        // TODO
    });
    return result;
}

},{"wlj-utilities":44}],33:[function(require,module,exports){

const u = require("wlj-utilities");

module.exports = set;

function set(left, right) {
    let result;
    u.scope(set.name, x => {
        u.assert(() => u.isString(left));

        result = {
            $type: 'set',
            left,
            right,
        }
    });
    return result;
}

},{"wlj-utilities":44}],34:[function(require,module,exports){

const u = require("wlj-utilities");

module.exports = steps;

function steps(s) {
    let result;
    u.scope(steps.name, x => {
        u.assert(() => u.isArray(s));
        
        result = {
            $type: "steps",
            steps: s
        }
    });
    return result;
}

},{"wlj-utilities":44}],35:[function(require,module,exports){

const u = require("wlj-utilities");
const assertIsValidType = require("./assertIsValidType");

module.exports = type;

function type(name, types) {
    let result;
    u.scope(type.name, x => {
        assertIsValidType(name, types);

        result = name;
    });
    return result;
}

},{"./assertIsValidType":12,"wlj-utilities":44}],36:[function(require,module,exports){

const u = require("wlj-utilities");

module.exports = typeInt;

function typeInt() {
    let result;
    u.scope(typeInt.name, x => {
        result = {
            $type: 'typeInt',
        };
    });
    return result;
}

},{"wlj-utilities":44}],37:[function(require,module,exports){

const u = require("wlj-utilities");

module.exports = typeList;

function typeList(nested) {
    let result;
    u.scope(typeList.name, x => {
        result = {
            $type: 'typeList',
            nested,
        };
    });
    return result;
}

},{"wlj-utilities":44}],38:[function(require,module,exports){

const u = require("wlj-utilities");

const assertIsValidType = require("./assertIsValidType");

module.exports = variable;

function variable(name, type) {
    let result;
    u.scope(variable.name, x => {
        u.merge(x,{name});
        u.merge(x,{type});
        u.assert(() => u.isString(name));

        result = {
            name,
            type,
        }
    });
    return result;
}

},{"./assertIsValidType":12,"wlj-utilities":44}],39:[function(require,module,exports){
const merge = require("./library/merge.js");
const core = require('./core');
const log = require('./log');
const assert = require('./assert');
const file = require('./file');
const tools = require('./tools');
const commandLine = require('./commandLine');

module.exports = {};
merge(module.exports, core);
merge(module.exports, log);
merge(module.exports, assert);
merge(module.exports, file);
merge(module.exports, tools);
merge(module.exports, commandLine);
},{"./assert":40,"./commandLine":41,"./core":42,"./file":43,"./library/merge.js":62,"./log":71,"./tools":72}],40:[function(require,module,exports){
const scope = require('./library/scope');
const isUndefined = require('./library/isUndefined');
const merge = require('./library/merge');
const assert = require('./library/assert');
const isFunction = require('./library/isFunction');


const {
    consoleLog,
    logProperties,
} = require('./log');

const {
    isDefined,
    processExit,
    isInteger,
} = require('./core');

const fs = require('fs');

module.exports = {
    assertFileExists,
    assertAtLeast,
    assertAtMost,
    assertIsEqual,
    assertIsDefined,
    assertIsEqualJson,
};

function assertError(name) {
    throw new Error('Assert error: ' + name);
}

function fileExists(fileName) {
    return fs.existsSync(fileName);
}

function assertFileExists(fileName) {
    return scope(assertFileExists.name, context => {
        merge(context, {fileName});
        assert(fileExists(fileName));
    });
}

function assertIsDefined(a) {
    return scope(assertIsDefined.name, context => {
        merge(context, {a});
        return assert(isDefined(a));
    });
}

function assertIsEqual(left, right) {
    return scope(assertIsEqual.name, context => {
        merge(context, {left});
        assertIsDefined(left);

        merge(context, {right});
        assertIsDefined(right);

        let leftValue;
        if (isFunction(left)) {
            leftValue = left();
        } else {
            leftValue = left;
        }
        merge(context, {leftValue});
        let rightValue;
        if (isFunction(right)) {
            rightValue = right();
        } else {
            rightValue = right;
        }
        merge(context, {rightValue});

        let equals = leftValue === rightValue;
        if (equals) {
            return;
        }
        return assertError(assertIsEqual.name);
    });
}

function assertIsEqualJson(left, right) {
    return scope(assertIsEqualJson.name, context => {
        merge(context, {left});
        merge(context, {right});

        assertIsDefined(left);
        assertIsDefined(right);

        let leftValue;
        if (isFunction(left)) {
            leftValue = left();
        } else {
            leftValue = left;
        }
        merge(context, {leftValue});
        let rightValue;
        if (isFunction(right)) {
            rightValue = right();
        } else {
            rightValue = right;
        }
        merge(context, {rightValue});

        let equals = JSON.stringify(leftValue) === JSON.stringify(rightValue);
        if (equals) {
            return;
        }
        return assertError(assertIsEqualJson.name);
    });
}

function assertAtLeast(left, right) {
    return scope(assertAtLeast.name, context => {
        merge(context, {left});
        merge(context, {right});

        assert(isInteger(left));
        assert(isInteger(right));

        let atLeast = left >= right;
        if (atLeast) {
            return;
        }
        return assertError(assertAtLeast.name);
    });
}

function assertAtMost(left, right) {
    return scope(assertAtMost.name, context => {
        merge(context, {left});
        merge(context, {right});

        assert(isInteger(left));
        assert(isInteger(right));

        let atMost = left <= right;
        if (atMost) {
            return;
        }
        return assertError(assertAtMost.name);
    });
}
},{"./core":42,"./library/assert":48,"./library/isFunction":56,"./library/isUndefined":60,"./library/merge":62,"./library/scope":67,"./log":71,"fs":73}],41:[function(require,module,exports){
(function (process){
const isString = require('./library/isString');
const scope = require('./library/scope');
const assert = require('./library/assert');
const merge = require('./library/merge');
const isArray = require('./library/isArray');
const isUndefined = require('./library/isUndefined');
const loop = require('./library/loop');

const fs = require('fs');
const path = require('path');
const { EOL } = require('os');

let verbose = false;

module.exports = {
    commandLine,
    fn,
    baseDirectory: '.',
    /** Whether or not this is the wlj-utilities NPM package */
    isWljUtilitiesPackage: false
};

function commandLine(commands) {
    scope(commandLine.name, x=> {
        if (isUndefined(commands)) {
            commands = {
                fn,
            };
        }

        let command = commands[process.argv[2]];
        if (!command) {
            console.log('Please use a command-line argument.');
            console.log('Valid command-line arguments:');
            loop(Object.keys(commands), c => {
                console.log(c);
            });
            return;
        }
        
        let remaining = process.argv.slice(3);
        if (verbose) {
            console.log('Calling: ' + command.name);
            console.log('Args: ' + remaining);
        }
        let result = command(remaining);
        console.log(result);
    
    });
}

function fn(args) {
    let result = [];
    scope(fn.name, x => {
        merge(x, {args});
        assert(() => isArray(args));

        if (args.length !== 1) {
            result.push('Expecting 1 argument');
            return;
        }

        let fnName = args[0];
        assert(() => isString(fnName));

        const library = 'library';
        let libDirectory = path.join(module.exports.baseDirectory, library);
        if (!fs.existsSync(libDirectory)) {
            fs.mkdirSync(libDirectory);
            result.push('Created ' + libDirectory);
        }

        let fnFile = path.join(libDirectory, fnName + '.js');
        assert(() => !fs.existsSync(fnFile));
        fs.writeFileSync(fnFile, `
${module.exports.isWljUtilitiesPackage ? 'const scope = require("./scope");' : 'const u = require("wlj-utilities");' }

module.exports = ${fnName};

function ${fnName}() {
    let result;
    ${module.exports.isWljUtilitiesPackage ? '' : 'u.'}scope(${fnName}.name, x => {
        // TODO
    });
    return result;
}
`);
        assert(() => fs.existsSync(fnFile));
        result.push('Created ' + fnFile);

        let testsDirectory = path.join(module.exports.baseDirectory, 'tests');
        if (!fs.existsSync(testsDirectory)) {
            fs.mkdirSync(testsDirectory);
            result.push('Created ' + testsDirectory);
        }

        let fnTestDirectory = path.join(testsDirectory, fnName);
        if (!fs.existsSync(fnTestDirectory)) {
            fs.mkdirSync(fnTestDirectory);
            result.push('Created ' + fnTestDirectory);
        }

        let testFile = path.join(fnTestDirectory, fnName + '.js');
        assert(() => !fs.existsSync(testFile));
        fs.writeFileSync(testFile, `
const u = require("${module.exports.isWljUtilitiesPackage ? '../../index' : 'wlj-utilities' }");

const ${fnName} = require("../../${library}/${fnName}.js");

u.scope(__filename, x => {
    // TODO
});
`);
        assert(() => fs.existsSync(testFile));
        result.push('Created ' + testFile);

        let allTestsFile = path.join(module.exports.baseDirectory, 'test.js');
        if (!fs.existsSync(allTestsFile)) {
            fs.writeFileSync(allTestsFile, '');
            result.push('Created ' + allTestsFile);
        } else {
            result.push('Modified ' + allTestsFile);
        }
        fs.appendFileSync(allTestsFile, EOL);
        fs.appendFileSync(allTestsFile, `require("./${testFile}");`)

        let indexFile = path.join(module.exports.baseDirectory, 'index.js');
        if (!fs.existsSync(indexFile)) {
            fs.writeFileSync(indexFile, 'module.exports = {};');
            result.push('Created ' + indexFile);
        } else {
            result.push('Modified ' + indexFile);
        }
        fs.appendFileSync(indexFile, EOL);
        fs.appendFileSync(indexFile, `module.exports.${fnName} = require("./library/${fnName}.js");`);
        result.push('Finished');
    });

    return result.join(EOL);
}
}).call(this,require('_process'))
},{"./library/assert":48,"./library/isArray":55,"./library/isString":59,"./library/isUndefined":60,"./library/loop":61,"./library/merge":62,"./library/scope":67,"_process":76,"fs":73,"os":74,"path":75}],42:[function(require,module,exports){
(function (process){
const isUndefined = require('./library/isUndefined');
const isString = require('./library/isString');
const config = require('./library/config');

module.exports = {
    processExit,
    isEqualJson,
    isDefined,
}

function processExit() {
    let log = false;
    if (log) {
        let stack = new Error().stack;
        console.log(stack);
    }
    if (config.processExit) {
        console.log('Calling process.exit(1)');
        process.exit(1);
    } else {
        console.log('config.processExit is false; Not calling process.exit(1)');
    }
}

function isEqualJson(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function isDefined(a) {
    return !isUndefined(a);
}
}).call(this,require('_process'))
},{"./library/config":54,"./library/isString":59,"./library/isUndefined":60,"_process":76}],43:[function(require,module,exports){
const {
    isDefined,
} = require('./core');

const scope = require('./library/scope');
const isString = require('./library/isString');
const isUndefined = require('./library/isUndefined');
const loop = require('./library/loop');
const merge = require('./library/merge');
const assert = require('./library/assert');

const {
    assertFileExists,
    assertIsEqual,
} = require('./assert');

const fs = require('fs');
const path = require('path');

module.exports = {
    readFile,
    getFiles,
    appendFileLine,
    copyFiles,
    deleteDirectory,
    getPackageVersion,
    bumpPackageVersion,
}

function readFile(fileName) {
    return scope(readFile.name, context => {
        assertFileExists(fileName);

        merge(context, {fileName});
        let file = fs.readFileSync(fileName, 'utf8');
        return file;
    });
}

function getFiles(directoryName) {
    return scope(getFiles.name, context => {
        assertFileExists(directoryName);

        merge(context, {directoryName});
        let result = fs.readdirSync(directoryName);
        return result;
    });
}

function appendFileLine(file, line) {
    scope(appendFileLine.name, context => {
        assertFileExists(file);
        if (isDefined(line)) {
            assert(() => isString(line));
            if (line.length > 0) {
                fs.appendFileSync(file, line);
            }
        }
        fs.appendFileSync(file, `
`);
    });
}

function copyFiles(fromDirectory, toDirectory) {
    scope(copyFiles.name, context => {
        const fileNames = fs.readdirSync(fromDirectory);
    
        // Create the directory if it doesn't exist.
        if (!fs.existsSync(toDirectory)) {
            fs.mkdirSync(toDirectory);
        }

        loop(fileNames, fileName => {
            let src = path.join(fromDirectory, fileName);
            let dest = path.join(toDirectory, fileName);
            fs.copyFileSync(src, dest);
        });
    })
}

function deleteDirectory(directory) {
    scope(deleteDirectory.name, context => {
        const fileNames = fs.readdirSync(directory);

        loop(fileNames, fileName => {
            let p = path.join(directory, fileName);
            fs.unlinkSync(p);
        });

        fs.rmdirSync(directory);
    });
}

const packageJson = 'package.json';

function getPackageVersion(packageDirectory) {
    let version;
    scope(getPackageVersion.name, x => {
        assert(() => isString(packageDirectory));
        let packagePath = path.join(packageDirectory, packageJson);

        let package = require(packagePath);

        version = package.version;
        merge(x, {version});
        assert(() => isDefined(version));
    })
    return version;
}

function bumpPackageVersion(packageDirectory) {
    let result;
    let log = false;
    scope(bumpPackageVersion.name, x => {
        assert(() => isString(packageDirectory));
        let version = getPackageVersion(packageDirectory);
        merge(x, {version});

        let parts = version.split('.');
        assertIsEqual(() => parts.length, 3);

        let build = parseInt(parts[2]);
        let nextBuild = build + 1;

        parts[2] = nextBuild;

        let nextVersion = parts.join('.');

        let packagePath = path.join(packageDirectory, packageJson);

        let package = require(packagePath);
        package.version = nextVersion;

        let json = JSON.stringify(package, null, 2);
        fs.writeFileSync(packagePath, json);
        if (log) console.log(`Updated version to ${nextVersion} in ` + packagePath);

        result = nextBuild;
    });
    return result;
}
},{"./assert":40,"./core":42,"./library/assert":48,"./library/isString":59,"./library/isUndefined":60,"./library/loop":61,"./library/merge":62,"./library/scope":67,"fs":73,"path":75}],44:[function(require,module,exports){
let all = require('./all');

module.exports = {};
module.exports.merge = require("./library/merge.js");

module.exports.merge(module.exports, all);

module.exports.throws = require("./library/throws.js");
module.exports.assertIsJsonResponse = require("./library/assertIsJsonResponse.js");
module.exports.assertIsEqualJson = require("./library/assertIsEqualJson.js");
module.exports.assert = require("./library/assert.js");
module.exports.scope = require("./library/scope.js");
module.exports.propertiesToString = require("./library/propertiesToString.js");
module.exports.toQueryString = require("./library/toQueryString.js");
module.exports.propertiesAreEqualAndOnlyContainsProperties = require("./library/propertiesAreEqualAndOnlyContainsProperties.js");
module.exports.assertIsStringArray = require("./library/assertIsStringArray.js");
module.exports.assertOnlyContainsProperties = require("./library/assertOnlyContainsProperties.js");
module.exports.arrayExcept = require("./library/arrayExcept.js");
module.exports.isArray = require("./library/isArray.js");
module.exports.assertThrows = require("./library/assertThrows.js");
module.exports.arrayContainsDuplicates = require("./library/arrayContainsDuplicates.js");
module.exports.range = require("./library/range.js");
module.exports.isInteger = require("./library/isInteger.js");
module.exports.isString = require("./library/isString.js");
module.exports.isFunction = require("./library/isFunction.js");
module.exports.isSetEqual = require("./library/isSetEqual.js");
module.exports.config = require("./library/config.js");
module.exports.arraySingle = require("./library/arraySingle.js");
module.exports.propertiesAreEqual = require("./library/propertiesAreEqual.js");
module.exports.loop = require("./library/loop.js");
module.exports.stringTrimLambdaPrefix = require("./library/stringTrimLambdaPrefix.js");
},{"./all":39,"./library/arrayContainsDuplicates.js":45,"./library/arrayExcept.js":46,"./library/arraySingle.js":47,"./library/assert.js":48,"./library/assertIsEqualJson.js":49,"./library/assertIsJsonResponse.js":50,"./library/assertIsStringArray.js":51,"./library/assertOnlyContainsProperties.js":52,"./library/assertThrows.js":53,"./library/config.js":54,"./library/isArray.js":55,"./library/isFunction.js":56,"./library/isInteger.js":57,"./library/isSetEqual.js":58,"./library/isString.js":59,"./library/loop.js":61,"./library/merge.js":62,"./library/propertiesAreEqual.js":63,"./library/propertiesAreEqualAndOnlyContainsProperties.js":64,"./library/propertiesToString.js":65,"./library/range.js":66,"./library/scope.js":67,"./library/stringTrimLambdaPrefix.js":68,"./library/throws.js":69,"./library/toQueryString.js":70}],45:[function(require,module,exports){

const scope = require("./scope");
const isArray = require("./isArray");
const assert = require("./assert");
const merge = require("./merge");
const range = require("./range");

module.exports = arrayContainsDuplicates;

function arrayContainsDuplicates(array) {
    let log = false;
    let result;
    scope(arrayContainsDuplicates.name, x => {
        merge(x,{array});
        assert(() => isArray(array));

        for (let i of range(array.length)) {
            merge(x,{i});
            for (let j of range(array.length)) {
                if (j <= i) {
                    continue;
                }

                if (array[i] === array[j]) {
                    if (log) console.log('arrayContainsDuplicates', { i,j })
                    result = true;
                    return;
                }
            }
        }

        if (log) console.log('arrayContainsDuplicates false');
        result = false;
    });
    return result;
}

},{"./assert":48,"./isArray":55,"./merge":62,"./range":66,"./scope":67}],46:[function(require,module,exports){

const scope = require("./scope");
const isArray = require("./isArray");
const assert = require("./assert");

module.exports = arrayExcept;

function arrayExcept(array, except) {
    let result;
    scope(arrayExcept.name, x => {
        assert(() => isArray(array));
        assert(() => isArray(except));
        
        result = [];

        for (let a of array) {
            if (except.includes(a)) {
                continue;
            }
            result.push(a);
        }
    });
    return result;
}

},{"./assert":48,"./isArray":55,"./scope":67}],47:[function(require,module,exports){

const scope = require("./scope");
const loop = require("./loop");
const propertiesAreEqual = require("./propertiesAreEqual");
const merge = require("./merge");
const assert = require("./assert");
const isUndefined = require("./isUndefined");

module.exports = arraySingle;

function arraySingle(array, matcher) {
    let result;
    scope(arraySingle.name, x => {
        merge(x,{array,matcher})
        let found = false;
        let keys = Object.keys(matcher);
        merge(x,{keys})
        loop(array, a => {
            if (propertiesAreEqual(a, matcher, keys)) {
                merge(x,{result});
                assert(() => !found);
                result = a;
                found = true;
            }
        })
        let p = propertiesAreEqual(array[0], matcher, keys)
        merge(x,{p});
        assert(() => found);
    });
    return result;
}

},{"./assert":48,"./isUndefined":60,"./loop":61,"./merge":62,"./propertiesAreEqual":63,"./scope":67}],48:[function(require,module,exports){

const scope = require("./scope");
const merge = require("./merge");
const isFunction = require("./isFunction");

module.exports = assert;

function assert(b) {
    let result;
    scope(assert.name, x => {
        merge(x, {b});

        let bValue;
        if (isFunction(b)) {
            delete x.b;
            merge(x, b);
            bValue = b();
        } else {
            bValue = b;
        }

        //merge(x, {bValue});
        if (bValue) {
            return;
        }

        throw new Error('assert failed');
    });
    return result;
}

},{"./isFunction":56,"./merge":62,"./scope":67}],49:[function(require,module,exports){
const assert = require("./assert");
const scope = require('./scope');
const isDefined = require("../core").isDefined;
const isFunction = require("./isFunction");
const merge = require("./merge");

module.exports = assertIsEqualJson;

function assertIsEqualJson(left, right) {
    let result;
    scope(assertIsEqualJson.name, x => {
        merge(x, {left});
        merge(x, {right});
        assert(() => isDefined(left));
        assert(() => isDefined(right));

        let leftValue;
        if (isFunction(left)) {
            leftValue = left();
        } else {
            leftValue = left;
        }
        merge(x, {leftValue});

        let rightValue;
        if (isFunction(right)) {
            rightValue = right();
        } else {
            rightValue = right;
        }
        merge(x, {rightValue});

        assert(() => JSON.stringify(leftValue) === JSON.stringify(rightValue));
    });
    return result;
}

},{"../core":42,"./assert":48,"./isFunction":56,"./merge":62,"./scope":67}],50:[function(require,module,exports){
const scope = require("./scope");
const assert = require("./assert");
const merge = require("./merge");
const isInteger = require("./isInteger");
const isFunction = require("./isFunction");
const isDefined = require("./../core").isDefined;

module.exports = assertIsJsonResponse;

function assertIsJsonResponse(response, status, body) {
    let result;
    scope(assertIsJsonResponse.name, x => {
        merge(x, {response});
        merge(x, {status});
        merge(x, {body});

        assert(() => isDefined(response));
        assert(() => isInteger(status));
        assert(() => isDefined(body));
        
        assert(() => response.statusCode === status);
        assert(() => isDefined(response.body));
        assert(() => isFunction(response.body.toString));

        let actualJson = response.body.toString();
        merge(x, {actualJson});

        let expectedJson = JSON.stringify(body);
        merge(x, {expectedJson});

        assert(() => actualJson === expectedJson);
    });
    return result;
}

},{"./../core":42,"./assert":48,"./isFunction":56,"./isInteger":57,"./merge":62,"./scope":67}],51:[function(require,module,exports){

const assert = require("./assert");
const scope = require("./scope");
const isArray = require("./isArray");
const isString = require("./isString");

module.exports = assertIsStringArray;

function assertIsStringArray(array) {
    let result;
    scope(assertIsStringArray.name, x => {
        assert(() => isArray(array));

        for (let a of array) {
            assert(() => isString(a));
        }
    });
    return result;
}

},{"./assert":48,"./isArray":55,"./isString":59,"./scope":67}],52:[function(require,module,exports){

const scope = require("./scope");
const assert = require("./assert");
const merge = require("./merge");
const assertIsStringArray = require("./assertIsStringArray");
const isDefined = require("./../core").isDefined;

module.exports = assertOnlyContainsProperties;

function assertOnlyContainsProperties(object, properties) {
    let result;
    scope(assertOnlyContainsProperties.name, x => {
        merge(x, {object});
        merge(x, {properties});
        
        assert(() => isDefined(object));
        assertIsStringArray(properties);

        for (let key in object) {
            assert(() => properties.includes(key));
        }

        for (let property of properties) {
            assert(() => object.hasOwnProperty(property));
        }
    });
    return result;
}

},{"./../core":42,"./assert":48,"./assertIsStringArray":51,"./merge":62,"./scope":67}],53:[function(require,module,exports){

const scope = require("./scope");
const assert = require("./assert");
const throws = require("./throws");
const merge = require("./merge");

module.exports = assertThrows;

function assertThrows(lambda) {
    let result;
    scope(assertThrows.name, x => {
        merge(x, {lambda});
        assert(() => throws(lambda));
    });
    return result;
}

},{"./assert":48,"./merge":62,"./scope":67,"./throws":69}],54:[function(require,module,exports){

module.exports = {
    processExit: true,
    log: {
        scopeError: true,
    }
};
},{}],55:[function(require,module,exports){
module.exports = isArray;

function isArray(a) {
    return Array.isArray(a);
}
},{}],56:[function(require,module,exports){
module.exports = isFunction;

function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}
},{}],57:[function(require,module,exports){

const scope = require("./scope");

module.exports = isInteger;

function isInteger(a) {
    let result;
    scope(isInteger.name, x => {
        result = parseInt(a, 10) === a;
    });
    return result;
}

},{"./scope":67}],58:[function(require,module,exports){

const scope = require("./scope");
const assert = require("./assert");
const isArray = require("./isArray");

module.exports = isSetEqual;

function isSetEqual(a, b) {
    let result;
    scope(isSetEqual.name, x => {
        assert(() => isArray(a));
        assert(() => isArray(b));

        result = isSubset(a, b)
            && isSubset(b, a);

        function isSubset(a, b) {
            for (let i of a) {
                if (!b.includes(i)) {
                    return false;
                }
            }
            return true;
        }
    });
    return result;
}

},{"./assert":48,"./isArray":55,"./scope":67}],59:[function(require,module,exports){

module.exports = isString;

function isString(s) {
    let result = (s + "") === s;
    return result;
}

},{}],60:[function(require,module,exports){
module.exports = isUndefined;

function isUndefined(a) {
    return typeof a === 'undefined';
}
},{}],61:[function(require,module,exports){

const scope = require("./scope");
const merge = require("./merge");
const isFunction = require("./isFunction");
const assert = require("./assert");
const isArray = require("./isArray");

module.exports = loop;

function loop(array, lambda) {
    let result;

    let log = false;
    scope(loop.name, context => {
        merge(context, {array});
        merge(context, {lambda});

        assert(() => isArray(array));
        assert(() => isFunction(lambda));
    
        for (let index = 0; index < array.length; index++) {
            merge(context, {index});
            let element = array[index];
            merge(context, {element});
            let breakLoop = lambda(element, index);
            if (breakLoop) {
                break;
            }
        }
    });
    return result;
}

},{"./assert":48,"./isArray":55,"./isFunction":56,"./merge":62,"./scope":67}],62:[function(require,module,exports){
const isUndefined = require('./isUndefined')
const isFunction = require('./isFunction')
const stringTrimLambdaPrefix = require('./stringTrimLambdaPrefix');

module.exports = merge;

/**
 * Does something special with undefined.
 * Does something special if b is a function.
 * @param {*} a 
 * @param {*} b 
 */
function merge(a, b) {
    if (isUndefined(a)) {
        throw new Error('merge received undefined first argument');
    }
    if (isUndefined(b)) {
        throw new Error('merge received undefined second argument');
    }
    let bValue;
    if (isFunction(b)) {
        bValue = {};
        let key = stringTrimLambdaPrefix(b.toString());
        bValue[key] = b();
    } else {
        bValue = b;
    }
    for (let key in bValue) {
        a[key] = bValue[key];
        if (isUndefined(a[key])) {
            a[key] = '[undefined]';
        }
    }
}

},{"./isFunction":56,"./isUndefined":60,"./stringTrimLambdaPrefix":68}],63:[function(require,module,exports){

const scope = require("./scope");
const assertIsStringArray = require("./assertIsStringArray");
const merge = require("./merge");
const loop = require("./loop");

module.exports = propertiesAreEqual;

function propertiesAreEqual(a, b, properties) {
    let result;
    scope(propertiesAreEqual.name, x => {
        merge(x, {a,b,properties});
        assertIsStringArray(properties);

        result = true;
        loop(properties, property => {
            let equal = a[property] === b[property];
            if (!equal) {
                result = false;
                return true;
            }
        });
    });
    return result;
}

},{"./assertIsStringArray":51,"./loop":61,"./merge":62,"./scope":67}],64:[function(require,module,exports){

const scope = require("./scope");
const assert = require("./assert");
const assertOnlyContainsProperties = require("./assertOnlyContainsProperties");
const assertIsStringArray = require("./assertIsStringArray");
const propertiesAreEqual = require("./propertiesAreEqual");

module.exports = propertiesAreEqualAndOnlyContainsProperties;

function propertiesAreEqualAndOnlyContainsProperties(a, b, properties) {
    let result;
    scope(propertiesAreEqualAndOnlyContainsProperties.name, x => {
        assertOnlyContainsProperties(a, properties);
        assertOnlyContainsProperties(b, properties);
        
        result = propertiesAreEqual(a, b, properties);
    });
    return result;
}

},{"./assert":48,"./assertIsStringArray":51,"./assertOnlyContainsProperties":52,"./propertiesAreEqual":63,"./scope":67}],65:[function(require,module,exports){
const isFunction = require('./../library/isFunction');
const isUndefined = require('./isUndefined');
const truncateStringTo = require('./../log').truncateStringTo;

module.exports = propertiesToString;

function propertiesToString(object, prefix) {
    if (isUndefined(prefix)) {
        prefix = '';
    }

    let result;

    result = [];

    const maxCharacters = 120;
    for (let property in object) {
        let o = {};
        o[property] = object[property];

        if (isFunction(o[property])) {
            o[property] = o[property].toString();
        }

        let json = JSON.stringify(o);
        let trimmed = truncateStringTo(json, maxCharacters);

        result.push(prefix + trimmed);
    }
    return result;
}

},{"./../library/isFunction":56,"./../log":71,"./isUndefined":60}],66:[function(require,module,exports){

const scope = require("./scope");
const isUndefined = require("./isUndefined");
const merge = require("./merge");
const assert = require("./assert");
const isInteger = require("./isInteger");

module.exports = range;

function range(count, start) {
    let result;
    scope(range.name, x => {
        merge(x,{count});
        merge(x,{start});
        assert(() => isInteger(count));
        assert(() => count >= 0);
        if (isUndefined(start)) {
            start = 0;
        }
        
        result = [];
        let max = start + count - 1;
        for (let i = start; i <= max; i++) {
            result.push(i);
        }
    });
    return result;
}

},{"./assert":48,"./isInteger":57,"./isUndefined":60,"./merge":62,"./scope":67}],67:[function(require,module,exports){
const isString = require("./isString");
const isFunction = require("./isFunction");
const processExit = require("../core").processExit;
const propertiesToString = require("./propertiesToString");
const config = require("./config");

module.exports = scope;

let count = 0;

function scope(name, lambda) {
    count++;

    let result;
    
    if (!isString(name)) {
        error(scope.name, 'Expecting name to be string');
    }
    if (!isFunction(lambda)) {
        error(scope.name, 'Expecting lambda to be function');
    }

    const x = {};
    try {
        result = lambda(x);
    } catch (e) {
        count--;

        if (count === 0) {
            let indent = '  ';
            console.log(name + ' entered');
            let properties = propertiesToString(x, indent);
            for (let p of properties) {
                console.log(p);
            }

            let current = e;
            while ((current instanceof ScopeError)) {
                console.log(indent + current.name + ' entered');
                indent += '  '
                let properties = propertiesToString(current.context, indent);
                for (let p of properties) {
                    console.log(p);
                }
                current = current.innerError;
            }
            if (config.log.scopeError) console.log(current);

            processExit();
        } else {
            throw new ScopeError(name, x, e);
        }
    }

    count--;

    return result;
}

function error(name, message) {
    throw new Error(`Error: ${name}: ${message}`)
}

function ScopeError(name, context, innerError) {
    this.name = name;
    this.context = context;
    this.innerError = innerError;
}

//ScopeError.prototype = new Error();
},{"../core":42,"./config":54,"./isFunction":56,"./isString":59,"./propertiesToString":65}],68:[function(require,module,exports){

const scope = require("./scope");

module.exports = stringTrimLambdaPrefix;

function stringTrimLambdaPrefix(s) {
    let result = s;

    result = result.trim();

    let parenthesis = "()";
    if (result.startsWith(parenthesis)){
        result = result.substring(parenthesis.length); 
    }
    result = result.trim();

    let arrow = "=>";

    if (result.startsWith(arrow)){
        result = result.substring(arrow.length); 
    }
    result = result.trim();

    return result;
}

},{"./scope":67}],69:[function(require,module,exports){
const scope = require("./../library/scope");
const assert = require("./../library/assert");
const isFunction = require("./../library/isFunction");

module.exports = throws;

function throws(lambda) {
    let result;
    scope(throws.name, x => {
        assert(() => isFunction(lambda));
        try {
            lambda();
            result = false;
            return;
        } catch (e) {
            result = true;
            return;
        }
    });
    return result;
}

},{"./../library/assert":48,"./../library/isFunction":56,"./../library/scope":67}],70:[function(require,module,exports){

const scope = require("./scope");
const assert = require("./assert");
const merge = require("./merge");
const isDefined = require("./../core").isDefined;
const isString = require("./isString");

module.exports = toQueryString;

function toQueryString(object) {
    let result;
    scope(toQueryString.name, x => {
        merge(x, {object});
        assert(() => isDefined(object));

        result = '';
        let first = true;
        for (let key in object) {
            merge(x, {key});
            if (first) {
                result += "?";
                first = false;
            } else {
                result += '&';
            }
            result += key;
            let value = object[key];
            merge(x, {value});
            assert(() => isString(value));
            result += '=';
            result += value;
        }
    });
    return result;
}

},{"./../core":42,"./assert":48,"./isString":59,"./merge":62,"./scope":67}],71:[function(require,module,exports){
const {
    processExit,
    isUndefined,
    isFunction,
} = require('./core');

module.exports = {
    consoleLog,
    logProperties,
    truncateStringTo,
}

// TODO: Validate arguments of framework

let indent = 0;

let context = {};

function isString(o) {
    return o.toString() === o;
}

function getPrefix(offset) {
    offset = offset || 0;

    let tab = "  ";
    let prefix = "";
    for (let i = 0; i < indent - offset; i++) {
        prefix += tab;
    }
    return prefix;
}

function truncateStringTo(string, maxCharacters) {
    let ellipses = "...";
    if (string.length > maxCharacters) {
        string = string.substring(0, maxCharacters - ellipses.length);
        string += ellipses;
    }
    return string;
}

/**
 * Does something special if the property name is "parent".
 */
function logProperties(object, offset) {
    offset = offset || 0;
    let parent = '$parent';
    let name = '$name';

    let log = false;
    if (log) console.log('logProperties entered', {object});

    let prefix = getPrefix(offset);

    if (object.hasOwnProperty(parent)) {
        logProperties(object[parent], offset + 1);
    }

    if (object.hasOwnProperty(name)) {
        console.log(getPrefix(offset + 1) + object[name] + ' entered');
    }

    const maxCharacters = 120;
    for (let property in object) {
        if (log) console.log('logProperties', {property});
        if ([parent, name].includes(property)) {
            continue;
        }

        let o = {};
        o[property] = object[property];

        if (isFunction(o[property])) {
            o[property] = o[property].toString();
        }

        let json = JSON.stringify(o);
        if (log) console.log('logProperties', {json});
        if (log) console.log('logProperties', {keys:Object.keys(o)});

        let trimmed = truncateStringTo(json, maxCharacters);
        console.log(prefix + trimmed);
    }    
}

function scope(name, lambda) {
    let log = false;
    if (log) console.log('scope entered');
    if (log) consoleLog(name + " entered");

    let result;

    indent++;
    let oldContext = context;
    newContext = {};
    newContext.$name = name; 
    newContext.$parent = oldContext;
    context = newContext;
    try {
        result = lambda(context);
    } catch (e) {
        console.log('scope error');
        logProperties(context);
        console.log(e);
        processExit();
    }
    context = oldContext;
    indent--;

    if (log) consoleLog(name + " leaving");

    return result;
}

function consoleLog(message) {
    let log = false;
    let verbose = false;
    if (log) console.log('consoleLog entered');

    if (indent < 0) {
        if (verbose)
        if (log) console.log('indent negative');
        console.log('consoleLog error');
        console.log('need to call consoleLog inside scope');
        processExit();
    } else {
        if (verbose)
        if (log) console.log('indent not negative');
    }

    if (isString(message)) {
        if (verbose)
        if (log) console.log('message is string');
        let prefix = getPrefix();
        if (log) prefix = "message: " + prefix;
        console.log(prefix + message);

    } else {
        if (log) console.log('message is not string');
        logProperties(message);
    }

    if (log) console.log('consoleLog leaving');
}
},{"./core":42}],72:[function(require,module,exports){
const isInteger = require('./library/isInteger');
const isUndefined = require('./library/isUndefined');
const merge = require('./library/merge');
const assert = require('./library/assert');
const isArray = require('./library/isArray');
const isString = require('./library/isString');
const scope = require('./library/scope');
const loop = require('./library/loop');

const {
    isFunction,
    isDefined,
} = require('./core');

const {
    consoleLog,
} = require('./log');

module.exports = {
    toDictionary,
    isArrayIndex,
    arrayLast,
    arrayAll,
    arraySome,
    isDistinct,
    loopPairs,
    arrayMax,
    arrayMin,
    arrayCount,
    arrayMin,
    stringSuffix,
};


function toDictionary(array, property) {
    let result = {};

    scope(toDictionary.name, context => {
    
        loop(array, a => {
            let key = a[property];
            merge(context, {key});
            assert(() => isDefined(key));
    
            if (result[key]) {
                throw new Error('Duplicate key');
            }
            result[key] = a; 
        });
    })

    return result;
}

function isArrayIndex(array, index) {
    let result;
    scope(isArrayIndex.name, x => {
        merge(x,{array});
        merge(x,{index});
        let ia = isArray(array);
        merge(x,{ia});
        let is = isString(array);
        merge(x,{is});
        assert(() => ia || is);
        let ii = isInteger(index);
        merge(x,{ii});
        assert(() => ii);
        let lower = 0 <= index;
        let upper = index < array.length;
        merge(x,{lower});
        merge(x,{upper});
        result = lower && upper;
    });
    return result;
}

function arrayLast(array) {
    assert(() => isArray(array) || isString(array));
    return array[array.length - 1];
}
function arrayMax(array) {
    let max;

    scope(arrayAll.name, context => {
        assert(() => isArray(array));
        
        max = array[0]

        loop(array, a => {
            if (a > max) {
                max = a;
            }
        })
    });

    return max;
}
function arrayMin(array) {
    let min;

    scope(arrayAll.name, context => {
        assert(() => isArray(array));
        
        min = array[0]

        loop(array, a => {
            if (a < min) {
                min = a;
            }
        })
    });

    return min;
}

/**
 * Returns true if array is empty
 * or if predicate is true for each element
 * of the array
 * @param {*} array 
 * @param {*} predicate 
 */
function arrayAll(array, predicate) {
    let success = true;

    scope(arrayAll.name, context => {
        assert(() => isArray(array));

        loop(array, a => {
            if (!predicate(a)) {
                success = false;
                return true;
            }
        })
    });

    return success;
}

/**
 * Returns false if array is empty
 * or if predicate is true for some element
 * of the array
 * @param {*} array 
 * @param {*} predicate 
 */
function arraySome(array, predicate) {
    let success = false;

    scope(arraySome.name, context => {
        assert(() => isArray(array));

        loop(array, a => {
            if (predicate(a)) {
                success = true;
                return true;
            }
        })
    });

    return success;
}

function loopPairs(array, lambda) {
    scope(loopPairs.name, context => {
        loop(array, (a, i) => {
            let result;
            loop(array, (b, j) => {
                if (j <= i) {
                    return;
                }
    
                result = lambda(a, b);
                if (result) {
                    return true;
                }
            });
            if (result) {
                return true;
            }
        });
    });
}

function isDistinct(array) {
    let success = true;

    scope(isDistinct.name, context => {
        assert(() => isArray(array));

        loopPairs(array, (a, b) => {
            if (a === b) {
                success = false;
            }
        });
    });

    return success;
}


function arrayCount(array, predicate) {
    let count = 0;

    scope(arrayCount.name, context => {
        assert(() => isArray(array));

        loop(array, a => {
            if (predicate(a)) {
                count++;
            }
        })
    });

    return count;
}

function stringSuffix(string, count) {
    let result;
    scope(stringSuffix.name, context => {
        assert(() => isString(string));

        assert(() => isInteger(count));
        assert(() => 0 <= count);
        assert(() => count <= string.length);

        result = string.substring(string.length - count);
    });
    return result;
}
},{"./core":42,"./library/assert":48,"./library/isArray":55,"./library/isInteger":57,"./library/isString":59,"./library/isUndefined":60,"./library/loop":61,"./library/merge":62,"./library/scope":67,"./log":71}],"/library/directiveHome.js":[function(require,module,exports){

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

},{"./downloadFromServer":"/library/downloadFromServer.js","wlj-flow":9,"wlj-utilities":44}],"/library/downloadFromServer.js":[function(require,module,exports){

const u = require("wlj-utilities");
const request = require("sync-request");

const server = require("./getServer")();

// TODO: Rename this more to something more descriptive
module.exports = downloadFromServer;

function downloadFromServer(refs) {
    let result;
    u.scope(downloadFromServer.name, x => {
        let log = false;
        let wrapped = false;
        if (!u.isArray(refs)) {
            wrapped = true;
            refs = [refs];
        }
        u.assertIsStringArray(refs);
        let response = request('POST', server + "/download", {
            json: {
                refs,
            }
        });
        let json = response.body.toString();
        let body;
        try {
            body = JSON.parse(json)
        } finally {
            if (!body || !body.success || log) console.log(downloadFromServer.name + ": " + json);
        }
        u.assert(() => body.success === true);
        u.assert(() => u.isDefined(body.values));
        result = body.values;
        let keys = Object.keys(result);
        u.merge(x,{keys});
        for (let key of keys) {
            u.assert(() => u.isString(result[key]));
        }
        if (wrapped) {
            u.assert(() => keys.length === 1);
            result = result[keys[0]];
        }
    });
    return result;
}

},{"./getServer":"/library/getServer.js","sync-request":7,"wlj-utilities":44}],"/library/getServer.js":[function(require,module,exports){

const u = require("wlj-utilities");

module.exports = getServer;

function getServer() {
    let result;
    u.scope(getServer.name, x => {
        result = 'https://us-central1-flow-pl.cloudfunctions.net/'
    });
    return result;
}

},{"wlj-utilities":44}],"/library/sandbox.js":[function(require,module,exports){

const u = require("wlj-utilities");
const flow = require("wlj-flow");
const library = flow.getLibrary();

const downloadFromServer = require('./downloadFromServer')

module.exports = sandbox;

function sandbox() {
    let result;
    u.scope(sandbox.name, x => {
        let libraryNames = library.map(f => "flow/" + f.name);
        let downloaded = downloadFromServer(libraryNames);
        console.log({downloaded});
    });
    return result;
}

},{"./downloadFromServer":"/library/downloadFromServer.js","wlj-flow":9,"wlj-utilities":44}],"/library/uploadLibrary.js":[function(require,module,exports){

const u = require("wlj-utilities");
const flow = require("wlj-flow");
const library = flow.getLibrary();
const uploadToServer = require("./uploadToServer");

module.exports = uploadLibrary;

function uploadLibrary() {
    let result;
    u.scope(uploadLibrary.name, x => {
        u.assert(() => u.isDefined(library));
        u.loop(library, fn => {
            u.assert(() => u.isString(fn.name));
        });

        let values = library.map(fn => {
            return {
                ref: 'flow/' + fn.name,
                value: JSON.stringify(fn),
            }
        });

        uploadToServer(values);
    });
    return result;
}

},{"./uploadToServer":"/library/uploadToServer.js","wlj-flow":9,"wlj-utilities":44}],"/library/uploadToServer.js":[function(require,module,exports){

const u = require("wlj-utilities");
const request = require("sync-request");

const server = require("./getServer")();

module.exports = uploadToServer;

function uploadToServer(values) {
    let result;
    u.scope(uploadToServer.name, x => {
        if (!u.isArray(values)) {
            values = [values];
        }
        u.loop(values, value => {
            u.assert(() => u.isString(value.ref));
            u.assert(() => u.isString(value.value));
        })
        let log = false;
        let result = request('POST', server + "/upload", {
            json: {
                values,
            }
        });
        let json = result.body.toString();
        let body = JSON.parse(json)
        if (log || !body.success) console.log(uploadToServer.name + ": " + json);
        u.assert(() => body.success === true);
    });
    return result;
}

},{"./getServer":"/library/getServer.js","sync-request":7,"wlj-utilities":44}],73:[function(require,module,exports){

},{}],74:[function(require,module,exports){
exports.endianness = function () { return 'LE' };

exports.hostname = function () {
    if (typeof location !== 'undefined') {
        return location.hostname
    }
    else return '';
};

exports.loadavg = function () { return [] };

exports.uptime = function () { return 0 };

exports.freemem = function () {
    return Number.MAX_VALUE;
};

exports.totalmem = function () {
    return Number.MAX_VALUE;
};

exports.cpus = function () { return [] };

exports.type = function () { return 'Browser' };

exports.release = function () {
    if (typeof navigator !== 'undefined') {
        return navigator.appVersion;
    }
    return '';
};

exports.networkInterfaces
= exports.getNetworkInterfaces
= function () { return {} };

exports.arch = function () { return 'javascript' };

exports.platform = function () { return 'browser' };

exports.tmpdir = exports.tmpDir = function () {
    return '/tmp';
};

exports.EOL = '\n';

exports.homedir = function () {
	return '/'
};

},{}],75:[function(require,module,exports){
(function (process){
// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":76}],76:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[]);
