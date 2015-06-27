var SkinWebcam = function(spec, me) {

    /************************************************************
     * Private
     ************************************************************/

    me = me || {};
    var that = Webcam(spec, me);

    var superDraw = me.superior("draw");

    /************************************************************
     * Protected
     ************************************************************/

    me.showOverlay = true;

    me.drawSkinOverlay = function() {
        var ctx = that.context();

        ctx.save();

        ctx.beginPath();
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 2;
        ctx.moveTo(webcam.width() * 0.25 - 30, webcam.height() * 0.55 - 40);
        ctx.lineTo(webcam.width() * 0.25 - 30, webcam.height() * 0.55 + 40);
        ctx.lineTo(webcam.width() * 0.25 + 30, webcam.height() * 0.55 + 40);
        ctx.lineTo(webcam.width() * 0.25 + 30, webcam.height() * 0.55 - 40);
        ctx.lineTo(webcam.width() * 0.25 - 30, webcam.height() * 0.55 - 40);
        ctx.stroke();

        ctx.moveTo(webcam.width() * 0.75 - 30, webcam.height() * 0.55 - 40);
        ctx.lineTo(webcam.width() * 0.75 - 30, webcam.height() * 0.55 + 40);
        ctx.lineTo(webcam.width() * 0.75 + 30, webcam.height() * 0.55 + 40);
        ctx.lineTo(webcam.width() * 0.75 + 30, webcam.height() * 0.55 - 40);
        ctx.lineTo(webcam.width() * 0.75 - 30, webcam.height() * 0.55 - 40);
        ctx.stroke();

        ctx.restore();
    }

    me.draw = function() {
        superDraw();

        if (me.ready && me.showOverlay) {
            me.drawSkinOverlay();
        }
    };

    /************************************************************
     * Public
     ************************************************************/

    that.calculateSkinColor = function() {
        var image = Image({
            data: that.snapshot()
        });

        var totalColor = Color();
        var numPixels = 0;

        for (var i = webcam.width() * 0.25 - 30; i < webcam.width() * 0.25 + 30; i++) {
            for (var j = webcam.height() * 0.55 - 40; j < webcam.height() * 0.55 + 40; j++) {
                var pixelColor = image.color(Math.floor(i), Math.floor(j));
                totalColor.r += pixelColor.r;
                totalColor.g += pixelColor.g;
                totalColor.b += pixelColor.b;

                numPixels += 1;
            }
        }

        for (var i = webcam.width() * 0.75 - 30; i < webcam.width() * 0.75 + 30; i++) {
            for (var j = webcam.height() * 0.55 - 40; j < webcam.height() * 0.55 + 40; j++) {
                var pixelColor = image.color(Math.floor(i), Math.floor(j));
                totalColor.r += pixelColor.r;
                totalColor.g += pixelColor.g;
                totalColor.b += pixelColor.b;

                numPixels += 1;
            }
        }

        that.skinColor = Color({
            r: totalColor.r / numPixels,
            g: totalColor.g / numPixels,
            b: totalColor.b / numPixels
        });

        return that.skinColor;
    };

    that.showOverlay = function() {
        me.showOverlay = true;
    };

    that.hideOverlay = function() {
        me.showOverlay = false;
    };

    that.skinColor = Color({
        r: 0,
        g: 0,
        b: 0
    });

    return that;
}
