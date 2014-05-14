Template.carbon__layout.helpers({
    _layout: function() {
        var controller = Router.current();
        if (controller) {
            var data = {};
            data[Router.getConfig('contentKey')] = function() {
                return {
                    data: _.isFunction(controller.data) ? controller.data.call(null, controller.params) : controller.data,
                    template: Template[controller.template]
                };
            };

            return {
                data: data,
                template: Template[controller.layout]
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


