// Utility methods

Object.super = function (obj, name) {
    var that = obj,
        method = that[name];

    return function() {
        return method.apply(that, arguments);
    };
};

Array.matrix = function (m, n, initial) {
    var a, i, j, mat = [];

    for (i = 0; i < m; i += 1) {
        a = [];
        for (j = 0; j < n; j += 1) {
            a[j] = initial;
        }

        mat[i] = a;
    }

    return mat;
};

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
    var that = {
        x: (spec && spec.x) || 0,
        y: (spec && spec.y) || 0
    };

    that.add = function(pixel) {
        that.x += pixel.x;
        that.y += pixel.y;
        return that;
    };

    that.mult = function(constant) {
        that.x *= constant;
        that.y *= constant;
        return that;
    };

    that.div = function(constant) {
        that.x /= constant;
        that.y /= constant;
        return that;
    };

    that.squaredDistance = function(pixel) {
        return Math.pow(pixel.x - that.x, 2) + Math.pow(pixel.y - that.y, 2);
    };

    that.distance = function(pixel) {
        return Math.sqrt(that.squaredDistance(pixel));
    };

    return that;
};

var Color = function(spec) {
    var that = {
        r: (spec && spec.r) || 0,
        g: (spec && spec.g) || 0,
        b: (spec && spec.b) || 0
    };

    that.squaredDistance = function(color) {
        return Math.pow(color.r - that.r, 2) + Math.pow(color.g - that.g, 2) + Math.pow(color.b - that.b, 2);
    };

    that.distance = function(color) {
        return Math.sqrt(that.squaredDistance(color));
    };

    that.string = function() {
        return that.r + "," + that.g + "," + that.b;
    };

    that.rgbstring = function() {
        return "rgb(" + Math.floor(that.r) + "," + Math.floor(that.g) + "," + Math.floor(that.b) + ")";
    }

    return that;
}

var ImageDataWrapper = function(spec) {
    var that = {
        data: spec.data || { width: 0, height: 0, data: [] }
    };

    that.color = function(i, j) {
        if (that.data.width == 0 || that.data.height == 0 || i >= that.data.width || i < 0 || j >= that.data.height || j < 0) return null;

        var index = i * 4 + j * 4 * that.data.width;

        return Color({
            r: that.data.data[index + 0],
            g: that.data.data[index + 1],
            b: that.data.data[index + 2]
        });
    };

    return that;
}
