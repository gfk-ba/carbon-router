// Create global Router instance:
Router = new CarbonRouter();


// Upon startup, load the route corresponding to the browser url:
Meteor.startup(function() {
    if (Router.getConfig('autoLoad')) {
        Router.goUrl(window.location.pathname);
    }
});


