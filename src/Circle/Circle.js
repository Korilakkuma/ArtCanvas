(function(global) {
    'use strict';

    /**
     * This class is to represent circle.
     * @param {number} centerX This argument is horizontal coordinate of the center.
     * @param {number} centerY This argument is vertical coordinate of the center.
     * @param {number} radius This argument is circle radius.
     * @constructor
     * @implements {Drawable}
     */
    function Circle(centerX, centerY, radius) {
        // Call interface constructor
        Mocks.ArtCanvas.Drawable.call(this);

        this.centerX = 0;
        this.centerY = 0;
        this.radius  = 0;

        var cx = parseFloat(centerX);
        var cy = parseFloat(centerY);
        var r  = parseFloat(radius);

        if (!isNaN(cx)) {this.centerX = cx;}
        if (!isNaN(cy)) {this.centerY = cy;}
        if (r > 0)      {this.radius  = r;}
    }

    /** @implements {Drawable} */
    Circle.prototype = Object.create(Mocks.ArtCanvas.Drawable.prototype);
    Circle.prototype.constructor = Circle;

    /**
     * This method is getter for horizontal coordinate of the center.
     * @return {number} This is returned as horizontal coordinate of the center.
     */
    Circle.prototype.getCenterX = function() {
        return this.centerX;
    };

    /**
     * This method is getter for vertical coordinate of the center.
     * @return {number} This is returned as vertical coordinate of the center.
     */
    Circle.prototype.getCenterY = function() {
        return this.centerY;
    };

    /**
     * This method is getter for the center coordinate.
     * @return {Object.<string, number>} This is returned as associative array for the center coordinate.
     */
    Circle.prototype.getCenter = function() {
        return {x : this.centerX, y : this.centerY};
    };

    /**
     * This method is getter for circle radius.
     * @return {number} This is returned as circle radius.
     */
    Circle.prototype.getRadius = function() {
        return this.radius;
    };

    /** @override */
    Circle.prototype.draw = function(context) {
        context.beginPath();
        context.arc(this.centerX, this.centerY, this.radius, 0, (2 * Math.PI), false);
        context.stroke();
        context.fill();
    };

    /** @override */
    Circle.prototype.getCenterPoint = function(context) {
        return new Mocks.ArtCanvas.Point(this.centerX, this.centerY);
    };

    // Export
    global.Circle = Circle;

})(window);
