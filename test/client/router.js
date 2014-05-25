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
    router.add('twoParams', '/prefix-{x}/{y}', {
        paramDefaults: { y: 'default' }
    });
    test.equal(router.url('uno'), '/uno', 'Unparametrized URL.');
    test.equal(router.url('oneParam', {x: 123}), '/prefix/123', 'URL with single parameter.');
    test.equal(router.url('twoParams', {y: 456, x: 123}), '/prefix-123/456', 'URL with multiple parameters.');
    test.equal(router.url('invalid', {}), '', 'Non-existing route name results in empty URL.');
    test.throws(function() {
        router.url('invalid', {}, {check: true});
    });
    test.equal(router.url('oneParam', {}), '', 'Omitting required parameter results in empty URL.');
    test.throws(function() {
        router.url('oneParam', {}, {check: true});
    });
    test.equal(router.url('twoParams', {x: 123}), '/prefix-123/default', 'Omitting optional parameter.');
});


Tinytest.add('#CarbonRouter - Go to URL and test current controller', function(test) {
    Template['tpl_global_layout'] = 'Template::tpl_global_layout';
    Template['tpl_loading_content'] = 'Template::tpl_loading_content';
    Template['tpl_loading_layout'] = 'Template::tpl_loading_layout';
    Template['tpl_not_found_content'] = 'Template::tpl_not_found_content';
    Template['tpl_not_found_layout'] = 'Template::tpl_not_found_layout';
    Template['tpl_uno'] = 'Template::tpl_uno';
    Template['tpl_oneParam'] = 'Template::tpl_oneParam';
    Template['tpl_twoParams'] = 'Template::tpl_twoParams';
    Template['tpl_private_layout'] = 'Template::tpl_private_layout';

    var router = new CarbonRouter();
    var controller = null;
    var layout = null;
    var content = null;

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
    layout = controller.getLayoutTemplateAndData();
    content = controller.getContentTemplateAndData();
    test.equal(content.template(), Template['tpl_loading_content'], 'Content template for loading from router config.');
    test.equal(layout.template, Template['tpl_loading_layout'], 'Layout template for loading from router config.');

    router.go('uno');
    controller = router.current();
    layout = controller.getLayoutTemplateAndData();
    content = controller.getContentTemplateAndData();
    test.equal(content.template(), Template['tpl_uno'], 'Content template from route.');
    test.equal(layout.template, Template['tpl_global_layout'], 'Layout template from router config because not specified in route.');

    router.goUrl('/prefix/123');
    controller = router.current();
    layout = controller.getLayoutTemplateAndData();
    content = controller.getContentTemplateAndData();
    test.equal(content.template(), Template['tpl_oneParam'], 'Content template from route.');
    test.equal(layout.template, Template['tpl_private_layout'], 'Layout template from route.');
    test.equal(content.data().x, '123', 'URL parameter in content data.');
    test.equal(content.data().x, '123', 'URL parameter in layout data.');

    router.go('twoParams', {x: 123, y: 456});
    controller = router.current();
    layout = controller.getLayoutTemplateAndData();
    content = controller.getContentTemplateAndData();
    test.equal(content.template(), Template['tpl_twoParams'], 'Content template from route.');
    test.equal(layout.template, Template['tpl_global_layout'], 'Layout template from router config because not specified in route.');
    test.equal(content.data().x, '123', 'URL parameters in content data.');
    test.equal(content.data().x, '123', 'URL parameters in layout data.');
    test.equal(content.data().y, '456', 'URL parameters in content data.');
    test.equal(content.data().y, '456', 'URL parameters in layout data.');

    router.goUrl('/invalid');
    controller = router.current();
    layout = controller.getLayoutTemplateAndData();
    content = controller.getContentTemplateAndData();
    test.equal(content.template(), Template['tpl_not_found_content'], 'Content template for not-found from router config.');
    test.equal(layout.template, Template['tpl_not_found_layout'], 'Layout template for not-found from router config.');

});


Tinytest.add('#CarbonRouter - Before hook', function(test) {
    var router = new CarbonRouter();
    var beforeHookIsRun = false;
    var parameterIsPassedToBeforeHook = false;

    router.add('testbeforehook', '/{x}', {
        contentTemplate: 'tpl_test',
        before: function(params) {
            beforeHookIsRun = true;
            parameterIsPassedToBeforeHook = params.x === '123';
        }
    });

    router.goUrl('/123');
    controller = router.current();
    controller.callBeforeHook();
    test.equal(controller.contentTemplate, 'tpl_test', 'Content template from route.');
    test.isTrue(beforeHookIsRun, 'Before hook is run.');
    test.isTrue(parameterIsPassedToBeforeHook, 'Parameter is passed to before hook.');
});


