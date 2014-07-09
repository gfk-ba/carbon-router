
Tinytest.add('#CarbonController - Region data is merged', function(test) {
    var controller = new CarbonController();
    controller.setRegionTemplate('region1', 'dummy')
    controller.addRegionData('region1', {x: 123, y: 456});
    controller.addRegionData('region1', {y: 'overridden', z: 789, a: 'A'});
    controller.addRegionData('region2', {x: 456});
    controller.params = {a: 'param', b: 'param2'};

    var region1Data = controller.getRegionTemplateAndData('region1').data();
    test.equal(region1Data.x, 123, 'Non-overridden data is still available.');
    test.equal(region1Data.y, 'overridden', 'Data is overridden when merging the same key.');
    test.equal(region1Data.z, 789, 'New keys are merged with existing data.');
    test.equal(region1Data.a, 'A', 'Parameter is overridden by data.');
    test.equal(region1Data.b, 'param2', 'Non-overridden paramaters are available in data.');
    test.equal(region1Data.carbon_status, CarbonController.STATUS.FOUND, 'Data key carbon_status is always available and defaults to "' + CarbonController.STATUS.FOUND + '".');

    var region2Data = controller.getRegionTemplateAndData('region2').data();
    test.equal(region2Data.a, 'param', 'Parameter is not overridden for second region.');
    test.equal(region2Data.x, 456, 'Data for also available for second region.');
});


Tinytest.add('#CarbonController - Region templates', function(test) {
    Template['abc'] = 'TestTemplate';
    Template['xyz'] = 'TestTemplate-some_region';

    var regionTemplate = null;

    var controller = new CarbonController();
    controller.setRegionTemplate('region1', 'abc');

    regionTemplate = controller.getRegionTemplateAndData('region1').template;
    test.equal(regionTemplate, Template['abc'], 'Template name defined as string returns the indicated template for "region1".');

    controller.setRegionTemplate('region2', 'xyz');
    regionTemplate = controller.getRegionTemplateAndData('region2').template;
    test.equal(regionTemplate, Template['xyz'], 'Template name defined as string returns the indicated template for "region2".');
    regionTemplate = controller.getRegionTemplateAndData('non_existing_region').template;
    test.isNull(regionTemplate, 'Template for non-existing region is "undefined".');
});


Tinytest.add('#CarbonController - Before hook', function(test) {
    var controller = new CarbonController();
    var beforeFuncIsCalled = false;
    var beforeFunc = function() {
        beforeFuncIsCalled = true;
    };
    controller.setBeforeHook(beforeFunc);
    controller.callBeforeHook();
    test.isTrue(beforeFuncIsCalled, 'The before hook function is called.');
});

