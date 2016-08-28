(function(global) {
    'use strict';

    /**
     * This class has properties that are to draw text on canvas.
     * @param {string} text This argument is text that is drawn on canvas.
     * @param {Point} point This argument is the instance of Point for text position.
     * @param {TextStyle} textStyle This argument is the instance of TextStyle.
     * @constructor
     * @implements {Drawable}
     */
    function Text(text, point, textStyle) {
        // Call interface constructor
        Mocks.ArtCanvas.Drawable.call(this);

        this.text      = String(text);
        this.point     = new Mocks.ArtCanvas.Point(0, 0);
        this.textStyle = null;

        if (point instanceof Mocks.ArtCanvas.Point) {
            this.point = point;
        }

        if (textStyle instanceof Mocks.ArtCanvas.TextStyle) {
            this.textStyle = textStyle;
        }
    }

    /** @implements {Drawable} */
    Text.prototype = Object.create(Mocks.ArtCanvas.Drawable.prototype);
    Text.prototype.constructor = Text;

    /**
     * This method is getter for text that is drawn on canvas.
     * @return {string} This is returned as text that is drawn on canvas.
     */
    Text.prototype.getText = function() {
        return this.text;
    };

    /**
     * This method is getter for the instance of Point.
     * @return {Point} This is returned as the instance of Point.
     */
    Text.prototype.getPoint = function() {
        return this.point;
    };

    /**
     * This method is getter for the instance of TextStyle.
     * @return {TextStyle} This is returned as the instance of TextStyle.
     */
    Text.prototype.getTextStyle = function() {
        return this.textStyle;
    };

    /** @override */
    Text.prototype.draw = function(context) {
        var font  = this.textStyle.getFont();
        var color = this.textStyle.getColor();

        var heldColor = context.fillStyle;

        context.font      = font.getFontString();
        context.fillStyle = color;

        context.fillText(this.text, this.point.getX(), this.point.getY());

        context.fillStyle = heldColor;
    };

    /** @override */
    Text.prototype.getCenterPoint = function(context) {
        var font      = this.textStyle.getFont();
        var fontSize  = parseInt(font.getSize());

        var centerX = this.point.getX() + (context.measureText(this.text).width / 2);
        var centerY = this.point.getY() + (fontSize / 2);

        return new Mocks.ArtCanvas.Point(centerX, centerY);
    };

    // Export
    global.Text = Text;

})(window);
