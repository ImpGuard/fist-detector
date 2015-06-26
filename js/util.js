// Utility methods

Function.prototype.method = function(name, func) {
    this.prototype[name] = func;
    return this;
};

Object.method("superior", function (name) {
    var that = this,
        method = that[name];

    return function() {
        return method.apply(that, arguments);
    };
});

// Utility functions

var UserMedia = (function() {

    var exists = function() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia || navigator.msGetUserMedia);
    };

    var get = function(constraints, streamHandler, errorHandler) {
        return (navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia).call(navigator, constraints, streamHandler, errorHandler);
    };

    var that = {};
    that.exists = exists;
    that.get = get;

    return that;
})();

var Pixel = function(spec) {
    that = {
        x: spec.x || 0,
        y: spec.y || 0
    };

    that.squaredDistance = function(pixel) {
        return Math.pow(pixel.x - that.x, 2) + Math.pow(pixel.y - that.y, 2);
    };

    that.distance = function(pixel) {
        return Math.sqrt(squaredDistance(pixel));
    };

    return that;
};
