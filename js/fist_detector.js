var FistDetector = function(spec, me) {
    /************************************************************
     * Constants
     ************************************************************/

     var SKIN_COLOR_THRESHOLD = 4000;
     var WINDOW_EDGE_SIZE = 5;
     var FIST_WEIGHT_THRESHOLD = 10;
     var FIST_DISPLACEMENT_THRESHOLD = 1000;


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
            height = matrix[0].length,
            newMatrix = Array.matrix(width, height, 0);

        for (var i = 0; i < width; i++) {
            for (var j = 0; j < height; j++) {
                var color = matrix[i][j];

                if (color.squaredDistance(webcam.skinColor) <= SKIN_COLOR_THRESHOLD) {
                    newMatrix[i][j] = 1;
                } else {
                    newMatrix[i][j] = 0;
                }
            }
        }

        return newMatrix;
    };

    var meanFilter = function(matrix) {
        var width = matrix.length,
            height = matrix[0].length,
            newMatrix = Array.matrix(width, height, 0);

        var halfEdgeSize = (WINDOW_EDGE_SIZE - 1) / 2,
            windowSize = WINDOW_EDGE_SIZE * WINDOW_EDGE_SIZE;

        for (var i = halfEdgeSize; i < width - halfEdgeSize; i++) {
            for (var j = halfEdgeSize; j < height - halfEdgeSize; j++) {
                var average = 0;

                for (var wi = -halfEdgeSize; wi <= halfEdgeSize; wi++) {
                    for (var wj = -halfEdgeSize; wj <= halfEdgeSize; wj++) {
                        average += matrix[i + wi][j + wj];
                    }
                }

                newMatrix[i][j] = Math.round(average / windowSize);
            }
        }

        return newMatrix;
    };

    var distanceWeight = function(dist) {
        return 1 / (1 + Math.exp(0.01 * (dist - 1)));
    };

    var findFists = function(matrix) {
        var width = matrix.length, height = matrix[0].length,
            left = Pixel({ x: leftPixel.x / samplingFreq, y: leftPixel.y / samplingFreq }),
            right = Pixel({ x: rightPixel.x / samplingFreq, y: rightPixel.y / samplingFreq }),
            leftBucket = Pixel(), rightBucket = Pixel(), leftTotal = 0, rightTotal = 0;

        // Gather pixels
        for (var i = 0; i < width; i++) {
            for (var j = 0; j < height; j++) {
                if (matrix[i][j] == 1) {
                    var pixel = Pixel({ x: i, y: j });

                    var leftDist = left.squaredDistance(pixel),
                        rightDist = right.squaredDistance(pixel),
                        weight;

                    if (leftDist < rightDist) {
                        weight = distanceWeight(leftDist);
                        leftBucket.add(pixel.mult(weight));
                        leftTotal += weight;
                        matrix[i][j] = { left: true, weight: weight };
                    } else {
                        weight = distanceWeight(rightDist);
                        rightBucket.add(pixel.mult(weight));
                        rightTotal += weight;
                        matrix[i][j] = { left: false, weight: weight };
                    }
                }
            }
        }

        // Calculate new means
        leftBucket.div(leftTotal);
        rightBucket.div(rightTotal);

        // Only update means if fists detected
        if (leftBucket.squaredDistance(left) < FIST_DISPLACEMENT_THRESHOLD &&
            rightBucket.squaredDistance(right) < FIST_DISPLACEMENT_THRESHOLD &&
            leftTotal > FIST_WEIGHT_THRESHOLD &&
            rightTotal > FIST_WEIGHT_THRESHOLD) {

            leftPixel = Pixel({ x: leftBucket.x * samplingFreq, y: leftBucket.y * samplingFreq });
            rightPixel = Pixel({ x: rightBucket.x * samplingFreq, y: rightBucket.y * samplingFreq });
        }
    };

    var displaySkinPixels = function(matrix) {
        for (var i = 0, x = 0; i < webcam.width(); i += samplingFreq, x++) {
            for (var j = 0, y = 0; j < webcam.height(); j += samplingFreq, y++) {
                var content = matrix[x][y];
                if (content) {
                    var color = Math.floor(255 * content.weight);

                    if (content.left) {
                        ctx.fillStyle = "rgb(0, " + color + ", 0)";
                    } else {
                        ctx.fillStyle = "rgb(0, 0, " + color + ")";
                    }

                    ctx.fillRect(i - samplingFreq / 2, j - samplingFreq / 2, samplingFreq + 1, samplingFreq + 1);
                }
            }
        }
    };

    var displayFists = function() {
        ctx.fillStyle = "rgb(255, 0, 0)";
        ctx.fillRect(leftPixel.x - samplingFreq / 2, leftPixel.y - samplingFreq / 2, samplingFreq + 3, samplingFreq + 3);
        ctx.fillRect(rightPixel.x - samplingFreq / 2, rightPixel.y - samplingFreq / 2, samplingFreq + 3, samplingFreq + 3);
    };

    var detectFists = function() {
        var image, matrix;

        // Convert webcam image into a sample matrix
        image = ImageDataWrapper({ data: webcam.snapshot() });
        matrix = sampleImage(image);

        // Apply skin filters
        matrix = gatherSkinPixels(matrix);
        matrix = meanFilter(matrix);

        // Detect fists
        findFists(matrix);

        // Display logging information in canvas
        if ($canvas.length) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            displaySkinPixels(matrix);
            displayFists();
        }

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

     that.reset = function() {
         leftPixel = Pixel({ x: webcam.width() * 0.25, y: webcam.height() * 0.55 });
         rightPixel = Pixel({ x: webcam.width() * 0.75, y: webcam.height() * 0.55 });
     };

     /************************************************************
     * Constructor
     ************************************************************/

     if (!$canvas.length) {
        console.log("Could not find canvas");
     }

     canvas = $canvas[0];
     ctx = canvas.getContext("2d");

     that.reset();

     return that;
};
