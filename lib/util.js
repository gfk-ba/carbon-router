
Util = {};


/***
 * Recursively retrieve a nested object property.
 *
 * @param {Object} obj from which to get the nested property
 * @param {String|Array} props Property to get
 * @param {String} sep Property separator
 * @returns {*} The nested property
 */
Util.getNestedProperty = function(obj, props, sep) {
    sep = _.isString(sep) && sep.length ? sep : '.';
    if (_.isString(props)) {
        props = props.split(sep);
    }

    while (props.length > 0 && _.isObject(obj)) {
        obj = obj[props.shift()];
    }

    return props.length === 0 ? obj : undefined;
};


/***
 * Format a string. Substitute placeholders with values.
 * Examples:
 *  - formatString('Hello {w}! {q}', {w: 'world', q: 'How are you?'}) -> 'Hello world! How are you?'
 *  - formatString('First: {}, Second: {}', ['One', 'Two']) -> 'First: One, Second: Two'
 *  - formatString('Curly {{braces}} can be escaped!') -> 'Curly {braces} can be escaped!'
 *  - formatString('Using simple values function. {Every} {placeholder} {will become} X', function() { return 'X'; }) -> 'Using simple values function. X X X X'
 *
 * @param {String} str
 * @param {Object|Array|Function} values
 * @returns {XML|*|string|void}
 */
Util.formatString = function(str, values) {
    values = _.isObject(values) || _.isFunction(values) ? values : {};
    var emptyKeyCount = 0;
    return str.replace(/{{|}}|{[^}]*}/g, function(m) {
        var value = '';
        var key = '';
        if (m === '{{') {
            value = '{';
        }
        else if (m === '}}') {
            value = '}';
        }
        else if (m === '{}') {
            key = emptyKeyCount++;
            value = _.isFunction(values) ? values(key) : values[key];
        }
        else {
            key = m.substr(1, m.length - 2);
            value = _.isFunction(values) ? values(key) : Util.getNestedProperty(values, key);
        }
        return typeof value !== 'undefined' ? value : '';
    });
};


