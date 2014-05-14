Template.carbon__layout.helpers({
    _layout: function() {
        var controller = Router.current();
        if (controller) {
            var layoutData = controller.layoutData();
            layoutData[Router.getConfig('contentKey')] = function() {
                return {
                    data: controller.contentData(),
                    template: Template[controller.contentTemplate]
                };
            };

            return {
                data: layoutData,
                template: Template[controller.layoutTemplate]
            };
        }
        else {
            return;
        }
    }
});


Template.carbon__layout.events = {
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


