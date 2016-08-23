(function(global) {
    'use strict';

    /**
     * This class is to represent color.
     * @param {number} red This argument is between 0 and 255.
     * @param {number} green This argument is between 0 and 255.
     * @param {number} blue This argument is between 0 and 255.
     * @param {number} alpha This argument is between 0 and 1.
     * @constructor
     */
    function Color(red, green, blue, alpha) {
        this.red   = 0;
        this.green = 0;
        this.blue  = 0;
        this.alpha = 1;

        var r = parseInt(red);
        var g = parseInt(green);
        var b = parseInt(blue);
        var a = parseFloat(alpha);

        if (!isNaN(r) && (r >= 0) && (r <= 255)) {
            this.red = r;
        }

        if (!isNaN(g) && (g >= 0) && (g <= 255)) {
            this.green = g;
        }

        if (!isNaN(b) && (b >= 0) && (b <= 255)) {
            this.blue = b;
        }

        if (!isNaN(a) && (a >= 0) && (a <= 1)) {
            this.alpha = a;
        }
    }

    /**
     * This method gets value of red.
     * @return {number} This is returned as value of red.
     */
    Color.prototype.getRed = function() {
        return this.red;
    };

    /**
     * This method gets value of green.
     * @return {number} This is returned as value of green.
     */
    Color.prototype.getGreen = function() {
        return this.green;
    };

    /**
     * This method gets value of blue.
     * @return {number} This is returned as value of blue.
     */
    Color.prototype.getBlue = function() {
        return this.blue;
    };

    /**
     * This method gets value of alpha.
     * @return {number} This is returned as value of alpha.
     */
    Color.prototype.getAlpha = function() {
        return this.alpha;
    };

    /**
     * This method gets color string as rgba format.
     * @return {string} This is returned as color string as rgba format.
     * @override
     */
    Color.prototype.toString = function() {
        var rgba = 'rgba(' + this.red + ', ' + this.green + ', ' + this.blue + ', ' + this.alpha + ')';

         return rgba;
    };

    /**
     * This method gets color string as hex format.
     * @return {string} This is returned as color string as hex format.
     */
    Color.prototype.toHexString = function() {
        var hex = '#';

        hex += this.red.toString(16) + this.green.toString(16) + this.blue.toString(16);

        return hex;
    };

    // Export
    global.Color = Color;

})(window);
