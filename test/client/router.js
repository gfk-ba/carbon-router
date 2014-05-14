var TestHelper = {
    createCarbonRouter: function() {
        var router = new CarbonRouter();
        router.configure({
            autoLoad: false
        });
        return router;
    }
};


Tinytest.add('#CarbonRouter - Set and read configuration', function(test) {
    var router = TestHelper.createCarbonRouter();
    var config = { dummy: 'DummyValue' };
    router.configure(config);
    test.equal(router.getConfig('dummy'), config.dummy, 'Retrieve configuration value.');
});


// TODO: Way more tests!

