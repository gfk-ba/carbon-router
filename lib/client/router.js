/**
 * @class CarbonRouter
 */
CarbonRouter = (function()
{
    var CONSTANTS = {
        sessionUrlKey: 'CarbonRouter::currentUrl'
    };


    if (window.onpopstate === null) {
        window.onpopstate = function(event) {
            Router.goUrl(window.location.pathname);
        };
    }


    /**
     * Parse a url, creating a regex and parameter list.
     * @param {String} url The url to parse.
     * @return {Object} RegExp for url, and parameter list.
     */
    var parseUrl = function(url) {
        var emptyKeyCount = 0;
        var params = [];

        var regex = Util.formatString(url, function(key) {
            params.push(key);
            return '([^/]+)';
        });

        return {
            params: params,
            regex: new RegExp('^' + regex + '$')
        };
    };


    /**
     * Constructor.
     */
    function CarbonRouter() {
        Session.set(CONSTANTS.sessionUrlKey, null);

        this._routes = {};
        this._config = {
            layoutTemplate: 'carbon__default_layout',
            layoutData: {},
            contentTemplate: 'carbon__default_content',
            contentData: {},
            loading: {
                layoutTemplate: null,
                contentTemplate: 'carbon__default_loading'
            },
            notFound: {
                layoutTemplate: null,
                contentTemplate: 'carbon__default_not_found'
            },
            contentKey: 'yield',
            autoLoad: true
        };
    }


    /**
     * Update configuration values.
     * @param {Object} config Conguration keys/values.
     */
    CarbonRouter.prototype.configure = function(config) {
        _.extend(this._config, config);
    };


    /**
     * Return a configuration value by key.
     * @param {String} key Configuration key.
     * @return {Variant} Configuration value.
     */
    CarbonRouter.prototype.getConfig = function(key) {
        return this._config[key];
    };


    /**
     * Add a route to the router.
     * @param {String} name Route name.
     * @param {String} url Route url, potentially containing parameters between curly brackets.
     * @param {Object} options Route options.
     * @param {String} options.contentTemplate Template name for route content.
     * @param {Object|Function} options.contentData Data object or generating function passed as the content context.
     * @param {String} options.layoutTemplate (optional) Template name for route layout.
     * @param {Object|Function} options.layoutData Data object or generating function passed as the layout context.
     */
    CarbonRouter.prototype.add = function(name, url, options) {
        this._routes[name] = {
            url: url,
            parsedUrl: parseUrl(url),
            contentTemplate: options.contentTemplate,
            contentData: options.contentData,
            layoutTemplate: options.layoutTemplate,
            layoutData: options.layoutData,
            before: options.before
        };
    };


    /**
     * Find a matching route for the url. Usually only needed internally.
     * @param {String} url Url.
     * @return {Object|null} Route object or null.
     */
    CarbonRouter.prototype.matchUrl = function(url) {
        for (var name in this._routes) {
            if (this._routes.hasOwnProperty(name)) {
                var route = this._routes[name];

                var regexResult = route.parsedUrl.regex.exec(url);
                if (regexResult !== null) {
                    return {
                        route: route,
                        params: _.object(route.parsedUrl.params, regexResult.slice(1))
                    };
                }
            }
        }

        return null;
    };


    /**
     * Navigate to the specified url.
     * @param {String} url URL.
     */
    CarbonRouter.prototype.goUrl = function(url) {
        var origin = ClientUtil.getOrigin();
        if (url.indexOf(origin) === 0) {
            url = url.slice(origin.length - 1);
        }

        if (url !== window.location.pathname) {
            var absoluteUrl = ClientUtil.getOrigin() + url.slice(1);
            if (window.history && window.history.pushState) {
                history.pushState(null, '', absoluteUrl);
            }
            else {
                window.location.assign(absoluteUrl);
            }
        }

        Session.set(CONSTANTS.sessionUrlKey, url);
    };


    /**
     * Navigate to the specified route.
     * @param {String} name Route name.
     * @param {Object} params Route parameters.
     */
    CarbonRouter.prototype.go = function(name, params) {
        var url = this.url(name, params, {check: true});
        this.goUrl(url);
    };


    /**
     * Construct the URL for a route.
     * @param {String} name Route name.
     * @param {Object} params Route parameters.
     */
    CarbonRouter.prototype.url = function(name, params, options) {
        options = _.extend({}, options);
        var route = this._routes[name];
        if (!route) {
            if (options.check) {
                throw 'No matching route found';
            }
            else {
                return '';
            }
        }
        var url = Util.formatString(route.url, params);
        return url;
    };


    /**
     * Reactive method to retrieve the current route controller.
     * If no route is set, the loading controller is returned.
     * If no route matches with the current url, the not-found controller is returned.
     */
    CarbonRouter.prototype.current = function() {
        var controller = new CarbonController(this._config.contentKey);
        controller.addContentData(this._config.contentData);
        controller.addLayoutData(this._config.layoutData);
        controller.defaultLayoutTemplate = this._config.layoutTemplate;
        controller.defaultContentTemplate = this._config.contentTemplate;

        var url = Session.get(CONSTANTS.sessionUrlKey); // Reactive!
        if (url == null) {
            controller.layoutTemplate = this._config.loading.layoutTemplate;
            controller.contentTemplate = this._config.loading.contentTemplate;
            controller.addLayoutData(this._config.loading.layoutData);
            controller.addContentData(this._config.loading.contentData);
        }
        else {
            var match = this.matchUrl(url);
            if (match == null) {
                controller.layoutTemplate = this._config.notFound.layoutTemplate;
                controller.contentTemplate = this._config.notFound.contentTemplate;
                controller.addLayoutData(this._config.notFound.layoutData);
                controller.addContentData(this._config.notFound.contentData);
            }
            else {
                controller.setBeforeHook(match.route.before);

                controller.layoutTemplate = match.route.layoutTemplate;
                controller.contentTemplate = match.route.contentTemplate;
                controller.addLayoutData(match.route.layoutData);
                controller.addContentData(match.route.contentData);

                controller.params = match.params;
            }
        }

        return controller;
    };


    return CarbonRouter;
})();

