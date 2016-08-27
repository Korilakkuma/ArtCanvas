(function(global) {
    'use strict';

    /**
     * This class is to represent line.
     * @param {Point} startPoint This argument is the instance of Point for start point.
     * @param {Point} endPoint This argument is the instance of Point for end point.
     * @constructor
     * @implements {Drawable}
     */
    function Line(startPoint, endPoint) {
        // Call interface constructor
        Mocks.ArtCanvas.Drawable.call(this);

        this.startPoint = new Mocks.ArtCanvas.Point(0, 0);
        this.endPoint   = new Mocks.ArtCanvas.Point(0, 0);

        if (startPoint instanceof Mocks.ArtCanvas.Point) {
            this.startPoint = startPoint;
        }

        if (endPoint instanceof Mocks.ArtCanvas.Point) {
            this.endPoint = endPoint;
        }
    }

    /** @implements {Drawable} */
    Line.prototype = Object.create(Mocks.ArtCanvas.Drawable.prototype);
    Line.prototype.constructor = Line;

    /**
     * This method is getter for the instance of Point for start point.
     * @return {Point} This is returned as the instance of Point for start point.
     */
    Line.prototype.getStartPoint = function() {
        return this.startPoint;
    };

    /**
     * This method is getter for the instance of Point for end point.
     * @return {Point} This is returned as the instance of Point for end point.
     */
    Line.prototype.getEndPoint = function() {
        return this.endPoint;
    };

    /** @override */
    Line.prototype.draw = function(context) {
        context.beginPath();
        context.moveTo(this.startPoint.getX(), this.startPoint.getY());
        context.lineTo(this.endPoint.getX(), this.endPoint.getY());
        context.stroke();
    };

    /** @override */
    Line.prototype.getCenterPoint = function(context) {
        var minX = Math.min(this.startPoint.getX(), this.endPoint.getX());
        var minY = Math.min(this.startPoint.getY(), this.endPoint.getY());
        var maxX = Math.max(this.startPoint.getX(), this.endPoint.getX());
        var maxY = Math.max(this.startPoint.getY(), this.endPoint.getY());

        var centerX = ((maxX - minX) / 2) + minX;
        var centerY = ((maxY - minY) / 2) + minY;

        return new Mocks.ArtCanvas.Point(centerX, centerY);
    };

    // Export
    global.Line = Line;

})(window);
