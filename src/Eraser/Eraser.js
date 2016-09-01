(function(global) {
    'use strict';

    /**
     * This class is defined for the feature of eraser.
     * @param {Point} point This argumnet is the instance of Point.
     */
    function Eraser(point) {
        this.point = new Mocks.ArtCanvas.Point(0, 0);

        if (point instanceof Mocks.ArtCanvas.Point) {
            this.point = point;
        }
    }

    /**
     * This method is getter for the instance of Point.
     * @return {Point} This is returned as the instance of Point.
     */
    Eraser.prototype.getPoint = function() {
        return this.point;
    };

    /**
     * This method is getter for horizontal coordinate.
     * @return {number} This is returned as horizontal coordinate.
     */
    Eraser.prototype.getX = function() {
        return this.point.getX();
    };

    /**
     * This method is getter for vertical coordinate.
     * @return {number} This is returned as vertical coordinate.
     */
    Eraser.prototype.getY = function() {
        return this.point.getY();
    };

    // Export
    global.Eraser = Eraser;

})(window);
