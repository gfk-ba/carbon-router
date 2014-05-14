Tinytest.add('#Util.getNestedProperty - Check default separator', function(test) {
    var obj = {a: {b: 'c'}};
    test.equal(Util.getNestedProperty(obj, 'a.b'), 'c', 'Default separator is a dot.');
});


Tinytest.add('#Util.getNestedProperty - Check alternative separator', function(test) {
    var obj = {a: {b: 'c'}};
    test.equal(Util.getNestedProperty(obj, 'a/b', '/'), 'c', 'Alternative separator is used.');
});


Tinytest.add('#Util.getNestedProperty - Use properties array', function(test) {
    var obj = {a: {b: 'c'}};
    test.equal(Util.getNestedProperty(obj, ['a', 'b']), 'c', 'Properties array can be used.');
});


Tinytest.add('#Util.getNestedProperty - Return undefined if property is not found', function(test) {
    var obj = {a: {b: 'c'}, l: [0, 1, 2]};
    test.equal(Util.getNestedProperty(obj, 'x'), undefined, 'Invalid properties result in undefined.');
    test.equal(Util.getNestedProperty(obj, 'a.x'), undefined, 'Invalid properties result in undefined.');
    test.equal(Util.getNestedProperty(obj, 'a.b.c'), undefined, 'Invalid properties result in undefined.');
    test.equal(Util.getNestedProperty(obj, 'l.3'), undefined, 'Invalid properties result in undefined.');
});


Tinytest.add('#Util.getNestedProperty - Complex use cases', function(test) {
    var obj = {
        a: [
            {b: 'c'},
            {d: 'e'}
        ]
    };
    test.equal(Util.getNestedProperty(obj, 'a.0.b'), 'c', 'Arrays can be indexed.');
    test.equal(Util.getNestedProperty(obj, ['a', 1, 'd']), 'e', 'Arrays can be indexed with integers.');
});


Tinytest.add('#Util.formatString - String without placeholders', function(test) {
    test.equal(Util.formatString('Hello world', {}), 'Hello world', 'Same string should be returned.');
});


Tinytest.add('#Util.formatString - String escaped placeholder characters', function(test) {
    test.equal(Util.formatString('Hello {{world}}', {}), 'Hello {world}', 'Escaped placeholders are replaced with placeholders.');
    test.equal(Util.formatString('Hello {{world', {}), 'Hello {world', 'Escaped placeholders are replaced with placeholders.');
    test.equal(Util.formatString('}} Hello}} {{world', {}), '} Hello} {world', 'Escaped placeholders are replaced with placeholders.');
    test.equal(Util.formatString('{{}} {{{{}}}}', {}), '{} {{}}', 'Escaped placeholders are replaced with placeholders.');
});


Tinytest.add('#Util.formatString - Using values object', function(test) {
    test.equal(Util.formatString('Hello {x}', {x: 'world'}), 'Hello world', 'Placeholder key is looked up in values object.');
    test.equal(Util.formatString('{greeting} {audience}', {greeting: 'Hello', audience: 'world'}), 'Hello world', 'Placeholder key is looked up in values object.');
    test.equal(Util.formatString('{} {audience}! {}', {0: 'Hello', audience: 'world', 1: 'Bye'}), 'Hello world! Bye', 'Empty placeholder keys are looked up by index.');
});


Tinytest.add('#Util.formatString - Using values array', function(test) {
    test.equal(Util.formatString('Hello {}', ['world']), 'Hello world', 'Placeholder key is looked up by index in values array.');
    test.equal(Util.formatString('{} {}', ['Hello', 'world']), 'Hello world', 'Placeholder key is looked up by index in values array.');
});


Tinytest.add('#Util.formatString - Using values function', function(test) {
    test.equal(Util.formatString('Hello {}', function(key) { return 'world'; }), 'Hello world', 'Function return value is used to replace placeholder.');
    test.equal(Util.formatString('{} {}', function(k) { return ['Hello', 'world'][k]; }), 'Hello world', 'Placeholder key is passed to values function.');
});


Tinytest.add('#Util.formatString - Placeholders with undefined values are replaced by empty string', function(test) {
    test.equal(Util.formatString('Hello {x}!', {}), 'Hello !', 'Key is undefined in values object.');
    test.equal(Util.formatString('Hello {}!', []), 'Hello !', 'Index is out of range in values array.');
    test.equal(Util.formatString('Hello {}!', function(k) {}), 'Hello !', 'Nothing is returned by values function.');
});


Tinytest.add('#Util.formatString - Using nested keys', function(test) {
    test.equal(Util.formatString('Hello {x.y}', {x: {y: 'world'}}), 'Hello world', 'Placeholder key can have nested sub-keys');
});


