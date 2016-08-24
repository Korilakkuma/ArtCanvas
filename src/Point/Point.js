(function(global) {
    'use strict';

    /**
     * This class is to represent coordinate in the point.
     * Moreover, this class defined class methods to calculate coordinate.
     * @param {number} pointX This argument is horizontal coordinate.
     * @param {number} pointY This argument is vertical coordinate.
     * @constructor
     */
    function Point(pointX, pointY) {
        this.x = 0;
        this.y = 0;

        var x = parseFloat(pointX);
        var y = parseFloat(pointY);

        if (!isNaN(x)) {this.x = x;}
        if (!isNaN(y)) {this.y = y;}
    }

    /**
     * This method is getter for horizontal coordinate.
     * @return {number} This is returned as horizontal coordinate.
     */
    Point.prototype.getX = function() {
        return this.x;
    };

    /**
     * This method is getter for vertical coordinate.
     * @return {number} This is returned as vertical coordinate.
     */
    Point.prototype.getY = function() {
        return this.y;
    };

    /**
     * This class method calculates offset coordinate between the 2 points and creates the instance of Point.
     * @param {Point} point1 This argument is the instance of Point.
     * @param {Point} point2 This argument is the instance of Point.
     * @return {Point} This is returned as the instance of Point.
     */
    Point.getOffsetPoint = function(point1, point2) {
        var x = 0;
        var y = 0;

        if ((point1 instanceof Point) && (point2 instanceof Point)) {
            x = point2.getX() - point1.getX();
            y = point2.getY() - point1.getY();
        }

        return new Point(x, y);
    };

    /**
     * This class method calculates distance between the 2 points.
     * @param {Point} point1 This argument is the instance of Point.
     * @param {Point} point2 This argument is the instance of Point.
     * @return {number} This is returned as distance between the 2 points.
     */
    Point.getDistance = function(point1, point2) {
        var point = Point.getOffsetPoint(point1, point2);

        return Math.sqrt(Math.pow(point.getX(), 2) + Math.pow(point.getY(), 2));
    };

    // Export
    global.Point = Point;

})(window);
