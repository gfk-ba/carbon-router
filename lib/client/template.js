Template.carbon__region.helpers({
    getRegion: function(region) {
        var nonReactive = !this.layout;
        var controller = Router.current({nonReactive: nonReactive});
        if (controller) {
            return controller.getRegionTemplateAndData(region);
        }
        else {
            return;
        }
    }
});


Template.carbon__region_layout.events = {};


UI.registerHelper('carbonUrl', function(name, options) {
    return Router.url(name, options.hash);
});
