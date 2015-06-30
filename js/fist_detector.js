var FistDetector = function(spec, me) {
    /************************************************************
     * Constants
     ************************************************************/

     var SKIN_COLOR_THRESHOLD = 1500;

    /************************************************************
     * Private
     ************************************************************/

    me = me || {};
    var that = {};

    // Skin webcam to gather skin color and picture data.
    var webcam = spec.webcam;

    // Canvas to display
    var $canvas = $(spec.canvas),
        canvas, ctx;

    // Sampling Frequency when gathering skin pixels.
    var samplingFreq = spec.samplingFrequency || 5;

    // State information
    var analyzing = false;

    // Detection information
    var skinPixels, leftPixel, rightPixel;

    var gatherSkinPixels = function() {
        skinPixels = [];

        var image = Image({ data: webcam.snapshot() });

        for (var i = 0; i < webcam.width(); i += samplingFreq) {
            for (var j = 0; j < webcam.height(); j += samplingFreq) {
                var color = image.color(i, j);

                if (color.squaredDistance(webcam.skinColor) <= SKIN_COLOR_THRESHOLD) {
                    skinPixels.push(Pixel({ x: i, y: j }));
                }
            }
        }
    };

    var displaySkinPixels = function() {
        if ($canvas.length) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgb(0, 0, 0)";
            for (var i = 0; i < skinPixels.length; i++) {
                var pixel = skinPixels[i];
                ctx.fillRect(pixel.x - samplingFreq / 2, pixel.y - samplingFreq / 2, samplingFreq + 1, samplingFreq + 1);
            }
        }
    };

    var detectFists = function() {
        gatherSkinPixels();
        displaySkinPixels();

        requestAnimationFrame(detectFists);
    };

    /************************************************************
     * Public
     ************************************************************/

    that.start = function() {
        if (!webcam.ready()) {
            setTimeout(that.start, 500);
        } else if (!analyzing) {
            analyzing = true;
            requestAnimationFrame(detectFists);
        }
     };

     that.stop = function() {
        if (analyzing) {
            analyzing = false;
        }
     };

     /************************************************************
     * Constructor
     ************************************************************/

     if (!$canvas.length) {
        console.log("Could not find canvas");
     }

     canvas = $canvas[0];
     ctx = canvas.getContext("2d");

     return that;
};
