Package.describe({
    summary: 'CarbonRouter - An alternative, lightweight, modular client side router for Meteor',
    version: "0.2.0",
    name: "gfk:carbon-router",
    git: "https://github.com/gfk-ba/carbon-router.git"
});


Package.onUse(function (api) {
    api.versionsFrom('1.0');

    api.use('underscore', 'client');
    api.use('templating', 'client');
    api.use('ui', 'client');
    api.use('session', 'client');

    api.addFiles('lib/util.js', 'client');

    api.addFiles('lib/client/layout.html', 'client');
    api.addFiles('lib/client/util.js', 'client');
    api.addFiles('lib/client/controller.js', 'client');
    api.addFiles('lib/client/router.js', 'client');
    api.addFiles('lib/client/template.js', 'client');
    api.addFiles('lib/client/app.js', 'client');

    api.export('Router', 'client');

    api.export('Util', 'client', {testOnly: true});
    api.export('ClientUtil', 'client', {testOnly: true});
    api.export('CarbonController', 'client', {testOnly: true});
    api.export('CarbonRouter', 'client', {testOnly: true});
});


Package.onTest(function (api) {
    api.use('gfk:carbon-router', ['client', 'server']);
    api.use(['tinytest', 'practicalmeteor:munit@2.1.2', 'underscore'], ['client', 'server']);

    api.addFiles('test/util.js', 'client');
    api.addFiles('test/client/controller.js', 'client');
    api.addFiles('test/client/router.js', 'client');
});
