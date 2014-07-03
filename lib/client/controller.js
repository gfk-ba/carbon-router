/**
 * @class CarbonController
 */
CarbonController = (function()
{
    var CONSTANTS = {
        defaultRegionKey: '_'
    };


    /**
     * Assemble data.
     * @param {Array} dataList List of data objects or data generating functions.
     * @param {Object} initialData Initial data.
     * @return {Object} Data.
     */
    var assembleData = function(dataList, initialData, region) {
        var data = initialData ? _.clone(initialData) : {};
        _.each(dataList, function(item) {
            _.extend(data, _.isFunction(item) ? item.call(null, data, region) : item);
        });
        return data;
    };


    /**
     * Return the template name for the specified region.
     * @param {String|Object} template Template name or object with template names by region.
     * @param {String} region Region.
     * @return {Object|null} Template.
     */
    var templateForRegion = function(template, region) {
        var name = null;
        if (_.isString(template)) {
            if (region == null) {
                name = template;
            }
            else {
                throw 'Region "' + region + '" not specified';
            }
        }
        else {
            if (region == null) {
                region = CONSTANTS.defaultRegionKey;
            }
            name = template[region];
        }

        return Template[name] || null;
    };


    /**
     * Constructor.
     */
    function CarbonController() {
        this._regionDataLists = {};
        this._regionTemplates = {};
        this._before = null;
        this._status = CarbonController.STATUS.FOUND;
        this.params = {};
    }


    /**
     * Status constants.
     */
    CarbonController.STATUS = {
        FOUND: 'found',
        NOT_FOUND: 'not_found',
        LOADING: 'loading'
    };


    /**
     * Add data for the specified region.
     * @param {String} region Region.
     * @param {Object} data Data.
     */
    CarbonController.prototype.addRegionData = function(region, data) {
        if (!this._regionDataLists.hasOwnProperty(region)) {
            this._regionDataLists[region] = [];
        }
        this._regionDataLists[region].push(data);
    };


    /**
     * Set the template for the specified region.
     * @param {String} region Region.
     * @param {String} template Template name.
     */
    CarbonController.prototype.setRegionTemplate = function(region, template) {
        this._regionTemplates[region] = template;
    };


    /**
     * Return an object containing the region data and template.
     * @param String region Region name.
     * @return {Object} Region data and region template.
     */
    CarbonController.prototype.getRegionTemplateAndData = function(region) {
        var dataList = [{carbon_status: this._status}, this.params].concat(this._regionDataLists[region] || []);
        return {
            data: _.partial(assembleData, dataList, null),
            template: Template[this._regionTemplates[region]]
        };
    };


    /**
     * Set the status of this controller.
     * @param {CarbonController.STATUS} status
     */
    CarbonController.prototype.setStatus = function(status) {
        this._status = status;
    };


    /**
     * Set the before hook function.
     * @func {Function} Before hook function.
     */
    CarbonController.prototype.setBeforeHook = function(func) {
        if (_.isFunction(func)) {
            this._before = func;
        }
    };


    /**
     * Run the before hook function.
     */
    CarbonController.prototype.callBeforeHook = function() {
        this._before && this._before(this.params);
    };


    return CarbonController;
})();

