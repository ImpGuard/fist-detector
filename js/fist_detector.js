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
    var leftPixel, rightPixel;

    var sampleImage = function(image) {
        var width = Math.floor(webcam.width() / samplingFreq),
            height = Math.floor(webcam.height() / samplingFreq),
            sampledImage = Array.matrix(width, height, null);

        for (var i = 0; i < webcam.width(); i += samplingFreq) {
            for (var j = 0; j < webcam.height(); j += samplingFreq) {
                var color = image.color(i, j);

                sampledImage[i / samplingFreq][j / samplingFreq] = color;
            }
        }

        return sampledImage;
    };

    var gatherSkinPixels = function(matrix) {
        var width = matrix.length,
            height = matrix[0].length;

        for (var i = 0; i < width; i++) {
            for (var j = 0; j < height; j++) {
                var color = matrix[i][j];

                if (color.squaredDistance(webcam.skinColor) <= SKIN_COLOR_THRESHOLD) {
                    matrix[i][j] = 1;
                } else {
                    matrix[i][j] = 0;
                }
            }
        }
    };

    var displaySkinPixels = function(matrix) {
        if ($canvas.length) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgb(0, 0, 0)";
            for (var i = 0; i < webcam.width(); i += samplingFreq) {
                for (var j = 0; j < webcam.height(); j += samplingFreq) {

                    if (matrix[i / samplingFreq][j / samplingFreq] == 1) {
                        ctx.fillRect(i - samplingFreq / 2, j - samplingFreq / 2, samplingFreq + 1, samplingFreq + 1);
                    }
                }
            }
        }
    };

    var detectFists = function() {
        var image, sampledMatrix;

        // Convert webcam image into a sample matrix
        image = ImageDataWrapper({ data: webcam.snapshot() });
        sampledMatrix = sampleImage(image);

        // Apply filters and detect fists
        gatherSkinPixels(sampledMatrix);

        // Display logging information in canvas
        displaySkinPixels(sampledMatrix);

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
