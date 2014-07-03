Tinytest.add('#CarbonRouter - Set and read configuration', function(test) {
    var router = new CarbonRouter();
    var config = { dummy: 'DummyValue' };
    router.configure(config);
    test.equal(router.getConfig('dummy'), config.dummy, 'Retrieve configuration value.');
});


Tinytest.add('#CarbonRouter - Default configuration values', function(test) {
    var router = new CarbonRouter();
    router.configure({});
    test.equal(router.getConfig('autoLoad'), true, 'Default config value for autoLoad is true.');

    var regionsConfig = router.getConfig('regions');
    test.equal(regionsConfig.layout.template, 'carbon__default_layout', 'Default config value for layout region template.');
    test.equal(regionsConfig.layout.data, {}, 'Default config value for layout region data.');
    test.equal(regionsConfig.content.template, 'carbon__default_content', 'Default config value for content region template.');
    test.equal(regionsConfig.content.data, {}, 'Default config value for content region data.');
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
        regions: {
            layout: {
                template: 'tpl_global_layout',
            }
        }
    });

    router.add('uno', '/uno', {
        regions: {
            content: { template: 'tpl_uno' }
        }
    });
    router.add('oneParam', '/prefix/{x}', {
        regions: {
            content: { template: 'tpl_oneParam' },
            layout: { template: 'tpl_private_layout' }
        }
    });
    router.add('twoParams', '/prefix-{x}/{y}', {
        regions: {
            content: { template: 'tpl_twoParams' }
        }
    });

    controller = router.current();
    content = controller.getRegionTemplateAndData('content');
    test.equal(content.data().carbon_status, CarbonController.STATUS.LOADING, 'Carbon status is "' + CarbonController.STATUS.LOADING + '" when there is no current URL.');

    router.go('uno');
    controller = router.current();
    layout = controller.getRegionTemplateAndData('layout');
    content = controller.getRegionTemplateAndData('content');
    test.equal(content.template, Template['tpl_uno'], 'Content region template from route.');
    test.equal(layout.template, Template['tpl_global_layout'], 'Layout region template from router config because not specified in route.');

    router.goUrl('/prefix/123');
    controller = router.current();
    layout = controller.getRegionTemplateAndData('layout');
    content = controller.getRegionTemplateAndData('content');
    test.equal(content.template, Template['tpl_oneParam'], 'Content region template from route.');
    test.equal(layout.template, Template['tpl_private_layout'], 'Layout region template from route.');
    test.equal(content.data().x, '123', 'URL parameter in content region data.');
    test.equal(content.data().x, '123', 'URL parameter in layout region data.');

    router.go('twoParams', {x: 123, y: 456});
    controller = router.current();
    layout = controller.getRegionTemplateAndData('layout');
    content = controller.getRegionTemplateAndData('content');
    test.equal(content.template, Template['tpl_twoParams'], 'Content region template from route.');
    test.equal(layout.template, Template['tpl_global_layout'], 'Layout region template from router config because not specified in route.');
    test.equal(content.data().x, '123', 'URL parameters in content region data.');
    test.equal(content.data().x, '123', 'URL parameters in layout region data.');
    test.equal(content.data().y, '456', 'URL parameters in content region data.');
    test.equal(content.data().y, '456', 'URL parameters in layout region data.');

    router.goUrl('/invalid');
    controller = router.current();
    layout = controller.getRegionTemplateAndData('layout');
    content = controller.getRegionTemplateAndData('content');
    test.equal(content.data().carbon_status, CarbonController.STATUS.NOT_FOUND, 'Content region data carbon_status "' + CarbonController.STATUS.NOT_FOUND + '" for invalid url path.');
    test.equal(layout.data().carbon_status, CarbonController.STATUS.NOT_FOUND, 'Layout region data carbon_status "' + CarbonController.STATUS.NOT_FOUND + '" for invalid url path.');
});


Tinytest.add('#CarbonRouter - Before hook', function(test) {
    var router = new CarbonRouter();
    var beforeHookIsCalled = false;
    var parameterIsPassedToBeforeHook = false;

    router.add('testbeforehook', '/{x}', {
        regions: {
            content: { template: 'tpl_test' }
        },
        before: function(params) {
            beforeHookIsCalled = true;
            parameterIsPassedToBeforeHook = params.x === '123';
        }
    });

    router.goUrl('/123');
    controller = router.current();
    controller.callBeforeHook();
    test.isTrue(beforeHookIsCalled, 'Before hook is run.');
    test.isTrue(parameterIsPassedToBeforeHook, 'Parameter is passed to before hook.');
});


