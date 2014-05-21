
Tinytest.add('#CarbonController - Content data is merged', function(test) {
    var controller = new CarbonController('yield');
    controller.defaultContentTemplate = 'dummy';
    controller.addContentData({x: 123, y: 456});
    controller.addContentData({y: 'overridden', z: 789, a: 'A'});
    controller.params = {a: 'param'};

    var contentData = controller.getContentTemplateAndData().data();
    test.equal(contentData.x, 123, 'Non-overridden data is still available.');
    test.equal(contentData.y, 'overridden', 'Data is overridden when merging the same key.');
    test.equal(contentData.z, 789, 'New keys are merged with existing data.');
    test.equal(contentData.a, 'param', 'Parameters always override data.');
});


Tinytest.add('#CarbonController - Layout data is merged', function(test) {
    var contentKey = 'test123';
    var controller = new CarbonController(contentKey);
    controller.defaultContentTemplate = 'dummy';
    controller.addLayoutData({x: 123, y: 456});
    controller.addLayoutData({y: 'overridden', z: 789, a: 'A'});
    controller.params = {a: 'param'};
    controller.params[contentKey] = 'will_be_overridden';
    controller.addContentData({c: 123});

    var layoutData = controller.getLayoutTemplateAndData().data();
    test.equal(layoutData.x, 123, 'Non-overridden data is still available.');
    test.equal(layoutData.y, 'overridden', 'Data is overridden when merging the same key.');
    test.equal(layoutData.z, 789, 'New keys are merged with existing data.');
    test.equal(layoutData.a, 'param', 'Parameters always override data.');

    var contentData = layoutData[contentKey].data();
    test.equal(contentData.c, 123, 'Content data is available under content key in layout data.');
});


Tinytest.add('#CarbonController - Get content template for region', function(test) {
    Template['abc'] = 'TestTemplate';
    Template['xyz'] = 'TestTemplate-some_region';

    var contentTemplate = null;

    var contentKey = 'test123';
    var controller = new CarbonController(contentKey);

    controller.contentTemplate = 'abc';
    contentTemplate = controller.getContentTemplateAndData().template();
    test.equal(contentTemplate, Template['abc'], 'Template name defined as string returns the indicated template.');

    test.throws(function() {
        var dummy = controller.getContentTemplateAndData().template('some_region');
    });


    controller.contentTemplate = {
        _: 'abc',
        'some_region': 'xyz'
    };
    contentTemplate = controller.getContentTemplateAndData().template();
    test.equal(contentTemplate, Template['abc'], 'Unspecified region returns template for default region.');
    contentTemplate = controller.getContentTemplateAndData().template('some_region');
    test.equal(contentTemplate, Template['xyz'], 'Specified region returns template for that region.');
    contentTemplate = controller.getContentTemplateAndData().template('invalid_region');
    test.isNull(contentTemplate, 'Invalid region returns no template.');
});


Tinytest.add('#CarbonController - Get content data for region', function(test) {
    var contentData = null;

    var contentKey = 'test123';
    var controller = new CarbonController(contentKey);
    controller.contentTemplate = {
        _: 'abc',
        some_region: 'xyz'
    };

    controller.addContentData({x: 123});
    contentData = controller.getContentTemplateAndData().data();
    test.equal(contentData.x, 123, 'Unspecified region returns all data.');
    contentData = controller.getContentTemplateAndData().data('some_region');
    test.equal(contentData.x, 123, 'Specified region returns all data if no data function used.');

    controller.addContentData(function(data, region) {
        return { region: region };
    });
    contentData = controller.getContentTemplateAndData().data();
    test.equal(contentData.region, undefined, 'Unspecified region is passed as undefined.');
    contentData = controller.getContentTemplateAndData().data('some_region');
    test.equal(contentData.region, 'some_region', 'Specified region is passed to data function.');
});


