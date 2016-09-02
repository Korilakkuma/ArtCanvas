(function(global) {

    /**
     * This class is to run image filter.
     * @param {string} type This argument is image filter type.
     * @param {Array.<number>} amounts This argument is the array that contains amount for image filter.
     * @constructor
     */
    function Filter(type, amounts) {
        this.type = Filter.NONE;

        if (String(type).toUpperCase() in Filter) {
            this.type = String(type).toLowerCase();
        }

        this.amounts = [];

        if (Array.isArray(amounts)) {
            this.amounts = amounts;
        }
    }

    Filter.NONE        = 'none';
    Filter.REDEMPHASIS = 'redemphasis';
    Filter.GRAYSCALE   = 'grayscale';
    Filter.REVERSE     = 'reverse';
    Filter.NOISE       = 'noise';
    Filter.BLUR        = 'blur';

    /**
     * This method is getter for filter type.
     * @return {string} This is returned as filter type.
     */
    Filter.prototype.getType = function() {
        return this.type;
    };

    /**
     * This method is getter for filter amounts.
     * @return {Array.<number>} This is returned as filter amounts.
     */
    Filter.prototype.getAmounts = function() {
        return this.amounts;
    };

    /**
     * Thie method does not run filter.
     * @param {ImageData} input This argument is ImageData of original image.
     * @return {ImageData} This is returned as ImageData of original image.
     */
    Filter.prototype.none = function(input) {
        return input;
    };

    /**
     * This method is to run red-emphasis filter.
     * @param {ImageData} input This argument is ImageData of original image.
     * @param {ImageData} output This argument is ImageData for output of filtered image.
     * @return {ImageData} This is returned as ImageData of filterd image.
     */
    Filter.prototype.redemphasis = function(input, output) {
         for (var i = 0, len = input.data.length; i < len; i++) {
            switch (i % 4) {
                case 0 :
                    // Operate red color
                    output.data[i] = Math.floor(1.5 * input.data[i]);
                    break;
                case 1 :
                    // Operate green color
                    output.data[i] = Math.floor(0 * input.data[i]);
                    break;
                case 2 :
                    // Operate blue color
                    output.data[i] = Math.floor(1 * input.data[i]);
                    break;
                case 3 :
                    // Operate alpha channel
                    output.data[i] = Math.floor(1 * input.data[i]);
                    break;
                default :
                    break;
            }
        }

        return output;
    };

    /**
     * This method is to run grayscale filter.
     * @param {ImageData} input This argument is ImageData of original image.
     * @param {ImageData} output This argument is ImageData for output of filtered image.
     * @return {ImageData} This is returned as ImageData of filterd image.
     */
    Filter.prototype.grayscale = function(input, output) {
        for (var i = 0, len = input.data.length; i < len; i += 4) {
            var mean = Math.floor((input.data[i] + input.data[i + 1] + input.data[i + 2]) / 3);
            output.data[i] = output.data[i + 1] = output.data[i + 2] = mean;
            output.data[i + 3] = input.data[i + 3];  // Alpha
        }

        return output;
    };

    /**
     * This method is to run reverse filter.
     * @param {ImageData} input This argument is ImageData of original image.
     * @param {ImageData} output This argument is ImageData for output of filtered image.
     * @return {ImageData} This is returned as ImageData of filterd image.
     */
    Filter.prototype.reverse = function(input, output) {
        for (var i = 0, len = input.data.length; i < len; i += 4) {
            output.data[i + 0] = 255 - input.data[i + 0];  // R
            output.data[i + 1] = 255 - input.data[i + 1];  // G
            output.data[i + 2] = 255 - input.data[i + 2];  // B
            output.data[i + 3] =       input.data[i + 3];  // Alpha
        }

        return output;
    };

    /**
     * This method is to run noise filter.
     * @param {ImageData} input This argument is ImageData of original image.
     * @param {ImageData} output This argument is ImageData for output of filtered image.
     * @return {ImageData} This is returned as ImageData of filterd image.
     */
    Filter.prototype.noise = function(input, output) {
        if (!Array.isArray(this.amounts) || (this.amounts.length < 3)) {
            return input;
        }

        var width = parseInt(this.amounts[0]);

        if (isNaN(width) || (width < 0)) {
            return input;
        }

        var height = parseInt(this.amounts[1]);

        if (isNaN(height) || (height < 0)) {
            return input;
        }

        var n = parseInt(this.amounts[2]);

        if (isNaN(n) || (n < 0)) {
            return input;
        }

        for (var i = 0; i < n; i++) {
            var x = Math.random() * width;
            var y = Math.random() * height;

            var p = Math.floor(((y * width) + x) * 4);

            var r = input.data[p + 0] >> 1;
            var g = input.data[p + 1] >> 2;
            var b = input.data[p + 2] >> 1;

            output.data[p + 0] = r;
            output.data[p + 1] = g;
            output.data[p + 2] = b;
            output.data[p + 3] = input.data[p + 3];
        }

        return output;
    };

    /**
     * This method is to run blur filter.
     * @param {ImageData} input This argument is ImageData of original image.
     * @param {ImageData} output This argument is ImageData for output of filtered image.
     * @return {ImageData} This is returned as ImageData of filterd image.
     */
    Filter.prototype.blur = function(input, output) {
        if (!Array.isArray(this.amounts) || (this.amounts.length < 1)) {
            return input;
        }

        var NUMBER_OF_ELEMENTS = 9;

        var indexs = new Array(NUMBER_OF_ELEMENTS);  // [(left-top), (top), (right-top), (left), (center), (right), (left-bottom), (bottom), (right-bottom)]
        var sum    = 0;
        var num    = 0;
        var width  = parseInt(this.amounts[0]);

        if (isNaN(width) || (width < 0)) {
            return input;
        }

        for (var i = 0, len = input.data.length; i < len; i++) {
            indexs = [(i - 4 - 4 * width), (i - 4 * width), (i + 4 - 4 * width),
                      (i - 4),             (i),             (i + 4),
                      (i - 4 + 4 * width), (i + 4 * width), (i + 4 + 4 * width)];

            // Clear previous value
            sum = 0;
            num = 0;

            for (var j = 0; j < NUMBER_OF_ELEMENTS; j++) {
                if ((indexs[j] >= 0) && (indexs[j] < input.data.length)) {
                    sum += input.data[indexs[j]];
                    num++;
                }
            }

            output.data[i] = Math.floor(sum / num);
        }

        return output;
    };

    /**
     * This method is facade method for image filter.
     * @param {Canvas} canvas This argument is the instance of Canvas.
     * @return {Filter} This is returned for method chain.
     */
    Filter.prototype.filter = function(canvas) {
        if (!(canvas instanceof Mocks.ArtCanvas.Canvas)) {
            return this;
        }

        var context = canvas.getContext();
        var c       = canvas.getCanvas();
        var input   = context.getImageData(0, 0, c.width, c.height);
        var output  = context.createImageData(c.width, c.height);

        context.putImageData(this[this.type](input, output), 0, 0);

        return this;
    };

    // Export
    global.Filter = Filter;

})(window);
