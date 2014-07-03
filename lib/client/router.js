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
     * Helper for applying a regions config to a controller.
     * @param {CarbonController} controller Controller.
     * @param {Object} regionsConfig Regions configuration.
     */
    var applyRegionsConfigToController = function(controller, regionsConfig) {
        _.each(regionsConfig, function(regionConfig, regionName) {
            controller.addRegionData(regionName, regionConfig.data);
            controller.setRegionTemplate(regionName, regionConfig.template);
        });
    };


    /**
     * Constructor.
     */
    function CarbonRouter() {
        // TODO? Override sessionUrlKey for testing purposes?
        Session.set(CONSTANTS.sessionUrlKey, null);

        this._currentController = null;
        this._routes = {};
        this._config = {
            regions: {
                layout: {
                    template: 'carbon__default_layout',
                    data: {}
                },
                content: {
                    template: 'carbon__default_content',
                    data: {}
                }
            },
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
     * @param {Object} options.regions Region templates and data by region name.
     */
    CarbonRouter.prototype.add = function(name, url, options) {
        var regions = options.regions || {};

        this._routes[name] = {
            url: url,
            parsedUrl: parseUrl(url),
            paramDefaults: options.paramDefaults,
            regions: options.regions,
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

        this._currentController = null;
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
                throw 'No route with this name found';
            }
            else {
                return '';
            }
        }

        params = _.extend({}, route.paramDefaults, params);
        if (_.difference(route.parsedUrl.params, _.keys(params)).length) {
            if (options.check) {
                throw 'Not all parameter values are filled in';
            }
            else {
                return '';
            }
        }
        var url = Util.formatString(route.url, params);
        return url;
    };


    /**
     * Construct a controller for the specified url.
     * @param {String} url Url.
     * @return {CarbonController} Controller.
     */
    CarbonRouter.prototype.constructController = function(url) {
        var controller = new CarbonController();
        applyRegionsConfigToController(controller, this._config.regions);

        if (url == null) {
            controller.setStatus(CarbonController.STATUS.LOADING);
        }
        else {
            var match = this.matchUrl(url);
            if (match == null) {
                controller.setStatus(CarbonController.STATUS.NOT_FOUND);
            }
            else {
                controller.setBeforeHook(match.route.before);
                applyRegionsConfigToController(controller, match.route.regions);
                controller.params = match.params;
            }
        }

        return controller;
    };


    /**
     * Reactive method to retrieve the current route controller.
     * If no route is set, the loading controller is returned.
     * If no route matches with the current url, the not-found controller is returned.
     */
    CarbonRouter.prototype.current = function() {
        var url = Session.get(CONSTANTS.sessionUrlKey); // Reactive!
        if (this._currentController === null) {
            this._currentController = this.constructController(url);
        }
        return this._currentController;
    };


    return CarbonRouter;
})();

