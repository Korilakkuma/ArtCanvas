(function(global) {
    'use strict';

    /**
     * This class is to represent text style.
     * @param {Font} font This argument is the instance of Font.
     * @param {string} color This argument is string for color.
     * @constructor
     */
    function TextStyle(font, color) {
        this.font  = null;
        this.color = String(color);

        if (font instanceof Mocks.ArtCanvas.Font) {
            this.font = font;
        }
    }

    /**
     * This method is getter for the instance of Font.
     * @return {Font} This is returned as the instance of Font.
     */
    TextStyle.prototype.getFont = function() {
        return this.font;
    };

    /**
     * This method is getter for color string.
     * @return {string} This is returned as color string.
     */
    TextStyle.prototype.getColor = function() {
        return this.color;
    };

    // Export
    global.TextStyle = TextStyle;

})(window);
