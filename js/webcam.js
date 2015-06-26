var Webcam = function(spec, me) {

    /************************************************************
     * Private
     ************************************************************/

    // Canvas variables that webcam will draw onto
    var $canvas = $(spec.canvas),
        canvas, ctx;

    // Hidden video element appended to body element
    var $video = $("<video />").hide(),
        video = $video[0];

    /************************************************************
     * Protected
     ************************************************************/

    me = me || {};

    me.ready = false;
    me.capturing = false;

    me.draw = function() {
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, canvas.width, canvas.height);

        if (me.capturing) {
            requestAnimationFrame(me.draw);
        }
    };

    /************************************************************
     * Public
     ************************************************************/

    var that = {};

    // Error handling function
    that.errorHandler = spec.errorHandler || function() {};

    that.isReady = function() {
        return ready;
    };

    that.start = function() {
        if (!me.ready) {
            setTimeout(that.start, 500);
        }

        video.play();
        me.capturing = true;
        requestAnimationFrame(me.draw);
    };

    that.stop = function() {
        video.pause();
        me.capturing = false;
    };

    that.snapshot = function() {
        if (!me.capturing || !me.ready) return;

        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    };

    that.context = function() {
        return ctx;
    };

    that.width = function() {
        return canvas.width;
    };

    that.height = function() {
        return canvas.height;
    };

    /************************************************************
     * Constructor
     ************************************************************/

    if (!UserMedia.exists()) {
            that.errorHandler("Webcam not supported");
        } else if (!$canvas.length) {
            that.errorHandler("Invalid arguments passed");
        }

        canvas = $canvas[0];
        ctx = canvas.getContext("2d");

        UserMedia.get({ video: true }, function(stream) {
            video.src = URL.createObjectURL(stream);
        }, that.errorHandler);

        $video.on("loadedmetadata", function() {
            me.ready = true;
    });

    return that;
};
