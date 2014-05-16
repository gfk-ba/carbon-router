
ClientUtil = {};


ClientUtil.getOrigin = function() {
    return window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: '') + '/';
};


ClientUtil.isRelativeHref = function(href) {
    var origin = ClientUtil.getOrigin();
    return href.indexOf(origin) === 0;
};


