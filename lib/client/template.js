Template.carbon__region.helpers({
    getRegion: function(region) {
        var controller = Router.current();
        if (controller) {
            return controller.getRegionTemplateAndData(region);
        }
        else {
            return;
        }
    }
});


Template.carbon__region_layout.events = {
    "click a": function(ev) {
        var href = ev.currentTarget.href;
        if (ClientUtil.isRelativeHref(href)) {
            ev.preventDefault();
            Router.goUrl(href);
        }
    }
};


UI.registerHelper('carbonUrl', function(name, options) {
    return Router.url(name, options.hash);
});

