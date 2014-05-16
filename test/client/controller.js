
Tinytest.add('#CarbonController - Content data is merged', function(test) {
    var controller = new CarbonController('yield');
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


