// General Utilities

Function.prototype.method = function(name, func) {
    this.prototype[name] = func;
    return this;
}

// Helpful Functions and Objects

var Util = (function() {

    var hasGetUserMedia = function() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia || navigator.msGetUserMedia);
    };

    var getUserMedia = function(constraints, streamHandler, errorHandler) {
        return (navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia).call(navigator, constraints, streamHandler, errorHandler);
    };

    var Pixel = function(x, y) {

        var squaredDistance = function(pixel) {
            return Math.pow(pixel.x - x, 2) + Math.pow(pixel.y - y, 2);
        };

        var distance = function(pixel) {
            return Math.sqrt(squaredDistance(pixel));
        };

        var that = { x: x, y: y };
        that.squaredDistance = squaredDistance;
        that.distance = distance;

        return that;
    };

    var that = {};
    that.hasGetUserMedia = hasGetUserMedia;
    that.getUserMedia = getUserMedia;
    that.Pixel = Pixel;

    return that;
})()
