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
     * @param {String} contentKey Content key in layout data.
     */
    function CarbonController(contentKey) {
        this._contentKey = contentKey;
        this._contentDataList = [];
        this._layoutDataList = [];
        this._before = null;
        this.defaultLayoutTemplate = null;
        this.defaultContentTemplate = null;
        this.layoutTemplate = null;
        this.contentTemplate = null;
        this.params = {};
    }


    /**
     * Add data for the content template.
     * @param {Object} data Data.
     */
    CarbonController.prototype.addContentData = function(data) {
        this._contentDataList.push(data);
    };


    /**
     * Return an object containing the content data and template.
     * @return {Object} Content data and content template.
     */
    CarbonController.prototype.getContentTemplateAndData = function() {
        return {
            data: _.partial(assembleData, this._contentDataList.concat([this.params]), null),
            template: _.partial(templateForRegion, this.contentTemplate || this.defaultContentTemplate)
        };
    };


    /**
     * Add data for the layout template.
     * @param {Object} data Data.
     */
    CarbonController.prototype.addLayoutData = function(data) {
        this._layoutDataList.push(data);
    };


    /**
     * Return an object containing the layout data and template.
     * @return {Object} Layout data and layout template.
     */
    CarbonController.prototype.getLayoutTemplateAndData = function() {
        var content = {};
        content[this._contentKey] = this.getContentTemplateAndData();
        var layoutDataList = this._layoutDataList.concat([this.params, content]);
        
        return {
            data: _.partial(assembleData, layoutDataList, null),
            template: Template[this.layoutTemplate || this.defaultLayoutTemplate]
        };
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

