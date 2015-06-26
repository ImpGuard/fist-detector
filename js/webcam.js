var Webcam = function(canvas, errorHandler) {
    // Default error handler
    errorHandler = errorHandler || function() {};

    // Canvas variables that webcam will draw onto
    var $canvas = $(canvas),
        canvas = $canvas[0],
        ctx;

    // Hidden video element appended to the body element
    var $video = $("<video />").hide(),
        video = $video[0];

    // State variables
    var ready = false,
        capturing = false;

    // Automatically setup webcam

    if (!Util.hasGetUserMedia()) {
        errorHandler("Webcam not supported")
    } else if (!$canvas.length) {
        errorHandler("Invalid arguments passed")
    }

    Util.getUserMedia({ video: true }, function(stream) {
        video.src = URL.createObjectURL(stream);
    }, errorHandler);

    $video.on("loadedmetadata", function() {
        ready = true;
    });

    ctx = canvas.getContext("2d");

    // Instance methods

    var isReady = function() {
        return ready;
    }

    var draw = function() {
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, canvas.width, canvas.height);

        if (capturing) {
            requestAnimationFrame(draw);
        }
    };

    var start = function() {
        if (!ready) {
            setTimeout(start, 500);
        }

        video.play();
        capturing = true;
        requestAnimationFrame(draw);
    };

    var stop = function() {
        video.pause();
        capturing = false;
    };

    var snapshot = function() {
        if (!capturing || !ready) return;

        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    };

    var getContext = function() {
        return ctx;
    };

    var width = function() {
        return canvas.width;
    }

    var height = function() {
        return canvas.height;
    }

    var that = {};
    that.start = start;
    that.stop = stop;
    that.getContext = getContext;
    that.video = video;
    that.width = width;
    that.height = height;

    return that;
}
