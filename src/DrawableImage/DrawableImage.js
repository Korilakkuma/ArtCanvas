(function(global) {
    'use strict';

    /**
     * This class extends Image class.
     * @param {string} src This argument is one of image file path, Data URL, Object URL.
     * @param {function} onloadCallback This argument is invoked when image was loaded.
     * @constructor
     * @extends {Image}
     * @implements {Drawable}
     */
    function DrawableImage(src, onloadCallback) {
        // Call interface constructor
        Mocks.ArtCanvas.Drawable.call(this);

        this.image     = new Image();
        this.image.src = src;

        this.image.onload = onloadCallback;
    }

    /** @extends {Image} */
    DrawableImage.prototype = Object.create(Image.prototype);

    /** @implements {Drawable} */
    DrawableImage.prototype = Object.create(Mocks.ArtCanvas.Drawable.prototype);

    DrawableImage.prototype.constructor = DrawableImage;

    /** @override */
    DrawableImage.prototype.draw = function(context) {
        context.drawImage(this.image, 0, 0);
    };

    /** @override */
    DrawableImage.prototype.getCenterPoint = function(context) {
        var centerX = this.image.width  / 2;
        var centerY = this.image.height / 2;

        return new Mocks.ArtCanvas.Point(centerX, centerY);
    };

    // Export
    global.DrawableImage = DrawableImage;

})(window);
