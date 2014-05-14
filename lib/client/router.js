
/**
 * @class CarbonRouter
 */
CarbonRouter = (function()
{
    var CONSTANTS = {
        sessionUrlKey: 'CarbonRouter::currentUrl'
    };


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
            layout: 'carbon__default_layout',
            loading: {
                layout: null,
                template: 'carbon__default_loading'
            },
            notFound: {
                layout: null,
                template: 'carbon__default_not_found'
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
     * @param {String} options.template Template name for route content.
     * @param {String} options.layout (optional) Template name for route layout.
     * @param {Variant|Function} options.data (optional) Data or function generating data to be passed to content template.
     */
    CarbonRouter.prototype.add = function(name, url, options) {
        this._routes[name] = {
            url: url,
            parsedUrl: parseUrl(url),
            template: options.template,
            layout: options.layout,
            data: options.data
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

        var absoluteUrl = window.location.origin + url;
        if (window.history && window.history.pushState) {
            history.pushState(null, '', absoluteUrl);
        }
        else {
            window.location.assign(absoluteUrl);
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
        var controller = {
            data: {},
            params: {}
        };

        var url = Session.get(CONSTANTS.sessionUrlKey);
        if (url == null) {
            controller.layout = this._config.loading.layout || this._config.layout;
            controller.template = this._config.loading.template;
        }
        else {
            var match = this.matchUrl(url);
            if (match == null) {
                controller.layout = this._config.notFound.layout || this._config.layout;
                controller.template = this._config.notFound.template;
            }
            else {
                controller.layout = match.route.layout || this._config.layout;
                controller.template = match.route.template;
                controller.data = match.route.data;
                controller.params = match.params;
            }
        }

        return controller;
    };


    return CarbonRouter;
})();


