Package.describe({
    summary: 'CarbonRouter - An alternative, lightweight, modular client side router for Meteor'
});


Package.on_use(function (api) {
    api.use('underscore', 'client');
    api.use('templating', 'client');
    api.use('ui', 'client');
    api.use('session', 'client');

    api.add_files('lib/util.js', 'client');

    api.add_files('lib/client/layout.html', 'client');
    api.add_files('lib/client/util.js', 'client');
    api.add_files('lib/client/controller.js', 'client');
    api.add_files('lib/client/router.js', 'client');
    api.add_files('lib/client/template.js', 'client');
    api.add_files('lib/client/app.js', 'client');

    api.export('Router', 'client');

    api.export('Util', 'client', {testOnly: true});
    api.export('CarbonController', 'client', {testOnly: true});
    api.export('CarbonRouter', 'client', {testOnly: true});
});


Package.on_test(function (api) {
    api.use('carbon-router', ['client', 'server']);
    api.use('tinytest', ['client', 'server']);

    api.add_files('test/util.js', 'client');
    api.add_files('test/client/controller.js', 'client');
    api.add_files('test/client/router.js', 'client');
});

