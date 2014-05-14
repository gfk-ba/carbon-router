
ClientUtil = {};


ClientUtil.getOrigin = function() {
    return Meteor.absoluteUrl();
};


ClientUtil.isRelativeHref = function(href) {
    var origin = ClientUtil.getOrigin();
    return href.indexOf(origin) === 0;
};


