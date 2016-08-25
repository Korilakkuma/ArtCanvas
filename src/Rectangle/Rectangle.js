(function(global) {
    'use strict';

    /**
     * This class is to represent rectangle.
     * @param {number} left This argument is horizontal coordinate at upper left.
     * @param {number} top This argument is vertical coordinate at upper-left.
     * @param {number} width This argument is rectangle width.
     * @param {number} height This argument is rectangle height.
     * @constructor
     * @implements {Drawable}
     */
    function Rectangle(left, top, width, height) {
        // Call interface constructor
        Mocks.ArtCanvas.Drawable.call(this);

        this.left   = 0;
        this.top    = 0;
        this.width  = 0;
        this.height = 0;

        var l = parseFloat(left);
        var t = parseFloat(top);
        var w = parseFloat(width);
        var h = parseFloat(height);

        if (!isNaN(l)) {this.left   = l;}
        if (!isNaN(t)) {this.top    = t;}
        if (w > 0)     {this.width  = w;}
        if (h > 0)     {this.height = h;}
    }

    /** @implements {Drawable} */
    Rectangle.prototype = Object.create(Mocks.ArtCanvas.Drawable.prototype);
    Rectangle.prototype.constructor = Rectangle;

    /**
     * This method is getter for horizontal coordinate at upper-left.
     * @return {number} This is returned as horizontal coordinate at upper-left.
     */
    Rectangle.prototype.getLeft = function() {
        return this.left;
    };

    /**
     * This method is getter for vertical coordinate at upper-left.
     * @return {number} This is returned as vertical coordinate at upper-left.
     */
    Rectangle.prototype.getTop = function() {
        return this.top;
    };

    /**
     * This method is getter for horizontal coordinate at lower-right.
     * @return {number} This is returned as horizontal coordinate at lower-right.
     */
    Rectangle.prototype.getRight = function() {
        return this.left + this.width;
    };

    /**
     * This method is getter for vertical coordinate at lower-right.
     * @return {number} This is returned as vertical coordinate at lower-right.
     */
    Rectangle.prototype.getBottom = function() {
        return this.top + this.height;
    };

    /**
     * This method is getter for coordinate at upper-left.
     * @return {Obect.<string, number>} This is returned as associative array for coordinate at upper-left.
     */
    Rectangle.prototype.getLeftTop = function() {
        return {left : this.left, top : this.top};
    };

    /**
     * This method is getter for coordinate at lower-right.
     * @return {Obect.<string, number>} This is returned as associative array for coordinate at lower-right.
     */
    Rectangle.prototype.getRightBottom = function() {
        return {right : (this.left + this.width), bottom : (this.top + this.height)};
    };

    /**
     * This method is getter for rectangle width.
     * @return {number} This is returned as rectangle width.
     */
    Rectangle.prototype.getWidth = function() {
        return this.width;
    };

    /**
     * This method is getter for rectangle height.
     * @return {number} This is returned as rectangle height.
     */
    Rectangle.prototype.getHeight = function() {
        return this.height;
    };

    /**
     * This method is getter for rectangle size.
     * @return {Object.<string, number>} This is returned as associative array for rectangle size.
     */
    Rectangle.prototype.getSize = function() {
        return {width : this.width, height : this.height};
    };

    /** @override */
    Rectangle.prototype.draw = function(context) {
        context.beginPath();
        context.rect(this.left, this.top, this.width, this.height);
        context.stroke();
        context.fill();
    };

    /** @override */
    Rectangle.prototype.getCenterPoint = function(context) {
        var centerX = (this.width  / 2) + this.left;
        var centerY = (this.height / 2) + this.top;

        return new Mocks.ArtCanvas.Point(centerX, centerY);
    };

    // Export
    global.Rectangle = Rectangle;

})(window);
