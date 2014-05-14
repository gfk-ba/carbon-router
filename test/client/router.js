Tinytest.add('#CarbonRouter - Set and read configuration', function(test) {
    var router = new CarbonRouter();
    var config = { dummy: 'DummyValue' };
    router.configure(config);
    test.equal(router.getConfig('dummy'), config.dummy, 'Retrieve configuration value.');
});


Tinytest.add('#CarbonRouter - Default configuration values', function(test) {
    var router = new CarbonRouter();
    router.configure({});
    test.equal(router.getConfig('contentKey'), 'yield', 'Default config value for contentKey is yield.');
    test.equal(router.getConfig('autoLoad'), true, 'Default config value for autoLoad is true.');
});


Tinytest.add('#CarbonRouter - Add and match routes', function(test) {
    var router = new CarbonRouter();

    router.add('uno', '/uno', {});
    router.add('oneParam', '/prefix/{x}', {});
    router.add('twoParams', '/prefix-{x}/{y}', {});

    test.isNotNull(router.matchUrl('/uno'), 'Match literal URL.');
    test.isNotNull(router.matchUrl('/prefix/123'), 'Use single parameter.');
    test.isNotNull(router.matchUrl('/prefix-123/456'), 'Use multiple parameters.');
    test.isNull(router.matchUrl('/prefix-/456'), 'Empty parameter value does not match.');
});


Tinytest.add('#CarbonRouter - Construct URL for a route', function(test) {
    var router = new CarbonRouter();
    router.add('uno', '/uno', {});
    router.add('oneParam', '/prefix/{x}', {});
    router.add('twoParams', '/prefix-{x}/{y}', {});
    test.equal(router.url('uno'), '/uno', 'Unparametrized URL.');
    test.equal(router.url('oneParam', {x: 123}), '/prefix/123', 'URL with single parameter.');
    test.equal(router.url('twoParams', {y: 456, x: 123}), '/prefix-123/456', 'URL with multiple parameters.');
    test.equal(router.url('invalid', {}), '', 'Non-existing route name results in empty URL.');
    test.throws(function() {
        router.url('invalid', {}, {check: true});
    });
});


Tinytest.add('#CarbonRouter - Go to URL and test current', function(test) {
    var router = new CarbonRouter();
    var controller = null;

    router.configure({
        layoutTemplate: 'tpl_global_layout',
        loading: {
            layoutTemplate: 'tpl_loading_layout',
            contentTemplate: 'tpl_loading_content'
        },
        notFound: {
            layoutTemplate: 'tpl_not_found_layout',
            contentTemplate: 'tpl_not_found_content'
        }
    });

    router.add('uno', '/uno', {
        contentTemplate: 'tpl_uno'
    });
    router.add('oneParam', '/prefix/{x}', {
        contentTemplate: 'tpl_oneParam',
        layoutTemplate: 'tpl_private_layout'
    });
    router.add('twoParams', '/prefix-{x}/{y}', {
        contentTemplate: 'tpl_twoParams'
    });

    controller = router.current();
    test.equal(controller.contentTemplate, 'tpl_loading_content', 'Content template for loading from router config.');
    test.equal(controller.layoutTemplate, 'tpl_loading_layout', 'Layout template for loading from router config.');

    router.go('uno');
    controller = router.current();
    test.equal(controller.contentTemplate, 'tpl_uno', 'Content template from route.');
    test.equal(controller.layoutTemplate, 'tpl_global_layout', 'Layout template from router config because not specified in route.');

    router.goUrl('/prefix/123');
    controller = router.current();
    test.equal(controller.contentTemplate, 'tpl_oneParam', 'Content template from route.');
    test.equal(controller.layoutTemplate, 'tpl_private_layout', 'Layout template from route.');
    test.equal(controller.params.x, '123', 'URL parameters in controller.');

    router.go('twoParams', {x: 123, y: 456});
    controller = router.current();
    test.equal(controller.contentTemplate, 'tpl_twoParams', 'Content template from route.');
    test.equal(controller.layoutTemplate, 'tpl_global_layout', 'Layout template from router config because not specified in route.');
    test.equal(controller.params.x, '123', 'URL parameters in controller.');
    test.equal(controller.params.y, '456', 'URL parameters in controller.');

    router.goUrl('/invalid');
    controller = router.current();
    test.equal(controller.contentTemplate, 'tpl_not_found_content', 'Content template for not-found from router config.');
    test.equal(controller.layoutTemplate, 'tpl_not_found_layout', 'Layout template for not-found from router config.');

});


Tinytest.add('#CarbonRouter - Before hook', function(test) {
    var router = new CarbonRouter();

    router.add('testbeforehook', '/', {
        contentTemplate: 'tpl_test',
        before: function(params) {
            params.fictional = 'foo';
        }
    });

    router.goUrl('/');
    controller = router.current();
    test.equal(controller.contentTemplate, 'tpl_test', 'Content template from route.');
    test.equal(controller.params.fictional, 'foo', 'Before hook has set fictional param.');
});


