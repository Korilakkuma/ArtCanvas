(function(global) {
    'use strict';

    /**
     * This class has properties that relate to font.
     * @param {string} family This argument is string like CSS font-family.
     * @param {string} size This argument is string like CSS font-size.
     * @param {string} style This argument is string like CSS font-style.
     * @param {string} weight This argument is string like CSS font-weight.
     * @constructor
     */
    function Font(family, size, style, weight) {
        this.family = String(family);
        this.size   = String(size);
        this.style  = String(style);
        this.weight = String(weight);
    }

    /**
     * This method is getter for font-family.
     * @return {string} This is returned as string for font-family.
     */
    Font.prototype.getFamily = function() {
        return this.family;
    };

    /**
     * This method is getter for font-size.
     * @return {string} This is returned as string for font-size.
     */
    Font.prototype.getSize = function() {
        return this.size;
    };

    /**
     * This method is getter for font-style.
     * @return {string} This is returned as string for font-style.
     */
    Font.prototype.getStyle = function() {
        return this.style;
    };

    /**
     * This method is getter for font-weight.
     * @return {string} This is returned as string for font-weight.
     */
    Font.prototype.getWeight = function() {
        return this.weight;
    };

    /**
     * This method joins string for font.
     * @return {string} This is returned as string for font.
     */
    Font.prototype.getFontString = function() {
        return this.style + ' ' + this.weight + ' ' + this.size + ' ' + '"' + this.family + '"';
    };

    /** @override */
    Font.prototype.toString = function() {
        return this.getFontString();
    };

    // Export
    global.Font = Font;

})(window);
