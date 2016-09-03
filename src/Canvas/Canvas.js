(function(global) {
    'use strict';

    /**
     * This class has properties to draw on each layer.
     * Therefore, the instance is created by the number of layers.
     * The instance of ArtCanvas manages the instance of this class.
     * @param {HTMLElement} container This argument is the instance of HTMLElement for wrapping HTMLCanvasElements.
     * @param {HTMLCanvasElement} canvas This argument is the instance of HTMLCanvasElement as the first layer.
     * @param {number} width This argument is canvas width.
     * @param {number} height This argument is canvas height.
     * @param {number} zIndex This argument is CSS z-index.
     * @constructor
     */
    function Canvas(container, canvas, width, height, zIndex) {
        this.container = document.body;
        this.canvas    = null;
        this.context   = null;

        if (container instanceof HTMLElement) {
            this.container = container;
        }

        if (canvas instanceof HTMLCanvasElement) {
            this.canvas = canvas;
        } else {
            this.canvas = document.createElement('canvas');
            this.container.appendChild(this.canvas);
        }

        this.context = this.canvas.getContext('2d');

        var w = parseInt(width);
        var h = parseInt(height);

        this.canvas.setAttribute('width',  (w > 0) ? w : Mocks.ArtCanvas.DEFAULT_SIZES.WIDTH);
        this.canvas.setAttribute('height', (h > 0) ? h : Mocks.ArtCanvas.DEFAULT_SIZES.HEIGHT);

        this.clear();

        this.canvas.style.position = 'absolute';
        this.canvas.style.top      = '0px';
        this.canvas.style.left     = '0px';
        this.canvas.style.zIndex   = zIndex;

        this.context.strokeStyle = new Mocks.ArtCanvas.Color(0, 0, 0, 1.0).toString();
        this.context.fillStyle   = new Mocks.ArtCanvas.Color(0, 0, 0, 1.0).toString();
        this.context.globalAlpha = 1.0;
        this.context.lineWidth   = 1.0;
        this.context.lineCap     = 'butt';
        this.context.lineJoin    = 'miter';

        /** {@type Array.<Point|Rectangle|Circle|Line|Text|Filter|DrawableImage>} */
        this.paths = [];

        this.historyPointer = 0;

        // Transform Matrix
        this.transforms = {
            translate : {x : 0, y : 0},
            scale     : {x : 1, y : 1},
            skew      : {x : 0, y : 0},
            rotate    : 0
        };
    }

    /**
     * This method is getter for the instance of HTMLCanvasElement.
     * @return {HTMLCanvasElement} This is returned as the instance of HTMLCanvasElement.
     */
    Canvas.prototype.getCanvas = function() {
        return this.canvas;
    };

    /**
     * This method is getter for the instance of CanvasRenderingContext2D.
     * @return {CanvasRenderingContext2D} This is returned as the instance of CanvasRenderingContext2D.
     */
    Canvas.prototype.getContext = function() {
        return this.context;
    };

    /**
     * This method is getter for the array that contains drawable objects.
     * @return {Array.<Point|Rectangle|Circle|Line|Text|Filter|DrawableImage>} This is returned as the array that contains drawable objects.
     */
    Canvas.prototype.getPaths = function() {
        return this.paths;
    };

    /**
     * This methods pushes the designated drawable object.
     * @param {Point|Rectangle|Circle|Line|Text|Filter|DrawableImage} path This argument is drawable object.
     * @return {Canvas} This is returned for method chain.
     */
    Canvas.prototype.pushPath = function(path) {
        this.paths[this.historyPointer] = path;
        return this;
    };

    /**
     * This method returns the drawable object that is designated by pointer.
     * @return {Point|Rectangle|Circle|Line|Text|Filter|DrawableImage} This is returned as the drawable object that is designated by pointer.
     */
    Canvas.prototype.popPath = function() {
        return this.paths[this.historyPointer];
    };

    /**
     * This method is getter for history position.
     * @return {number} This is returned as history position.
     */
    Canvas.prototype.getHistoryPointer = function() {
        return this.historyPointer;
    };

    /**
     * This method increases history position.
     * @return {Canvas} This is returned for method chain.
     */
    Canvas.prototype.increaseHistoryPointer = function() {
        this.historyPointer++;

        // On the way of undo ?
        if (this.historyPointer < this.paths.length) {
            this.paths = this.paths.slice(0, this.historyPointer);
        }

        return this;
    };

    /**
     * This method draws all stored objects.
     * @param {boolean} isTransform This argument is to determine whether or not to execute transform.
     * @return {Canvas} This is returned for method chain.
     */
    Canvas.prototype.draw = function(isTransform) {
        if (isTransform) {
            this.transform();
        }

        for (var i = 0; i < this.historyPointer; i++) {
            var paths = this.paths[i];

            if (Array.isArray(paths)) {
                for (var j = 0, len = paths.length; j < len; j++) {
                    var path = paths[j];
                    var x    = path.getX();
                    var y    = path.getY();

                    if (path instanceof Mocks.ArtCanvas.Eraser) {
                        this.context.globalCompositeOperation = 'destination-out';
                    }

                    if (j === 0) {
                        this.context.beginPath();
                        this.context.moveTo(x, y);
                    } else {
                        this.context.lineTo(x, y);
                        this.context.stroke();
                    }

                    if (path instanceof Mocks.ArtCanvas.Eraser) {
                        this.context.globalCompositeOperation = 'source-over';
                    }
                }
            } else if (paths instanceof Mocks.ArtCanvas.Filter) {
                paths.filter(this);
            } else {
                paths.draw(this.context);
            }
        }

        return this;
    };

    /**
     * This method creates textbox and draws the input text.
     * @param {TextStyle} textStyle This argument is the instance of TextStyle.
     * @return {string} This is returned as the input text.
     */
    Canvas.prototype.drawText = function(textStyle) {
        if (!(textStyle instanceof Mocks.ArtCanvas.TextStyle)) {
            return '';
        }

        var textbox = this.container.querySelector('[type="text"]');

        if (!(textbox instanceof HTMLInputElement)) {
            return '';
        }

        var font      = textStyle.getFont();
        var color     = textStyle.getColor();
        var fontSize  = parseInt(font.getSize());

        var text = textbox.value;
        var x    = parseInt(textbox.style.left);
        var y    = parseInt(textbox.style.top) + fontSize;

        this.container.removeChild(textbox);

        var heldColor = this.context.fillStyle;

        this.context.font      = font.getFontString();
        this.context.fillStyle = color;
        this.context.fillText(text, x, y);

        this.context.fillStyle = heldColor;

        this.paths.push(new Mocks.ArtCanvas.Text(text, new Mocks.ArtCanvas.Point(x, y), textStyle));
        this.increaseHistoryPointer();

        return text;
    };

    /**
     * This method draws image.
     * @param {string} src This argument is image file path.
     * @return {Canvas} This is returned for method chain.
     */
    Canvas.prototype.drawImage = function(src) {
        var self  = this;

        var image = new Mocks.ArtCanvas.DrawableImage(String(src), function() {
            self.context.drawImage(this, 0, 0);
            self.paths.push(image);
            self.historyPointer++;
        });

        return this;
    };

    /**
     * This method transforms the drawn objects on the basis of transform matrix.
     * @param {string} type This argument is string that is defined by Transform class.
     * @param {Arrat.<number>|number} amounts This argument is the amount of transform.
     * @return {Canvas} This is returned for method chain.
     */
    Canvas.prototype.transform = function(type, amounts) {
        if (!Array.isArray(amounts)) {
            amounts = [amounts];
        }

        var centerPoint = this.getCenterPoint();

        if (centerPoint === null) {
            return;
        }

        var centerX     = centerPoint.getX();
        var centerY     = centerPoint.getY();

        var transforms  = this.transforms;
        var translates  = transforms.translate;
        var scales      = transforms.scale;
        var skews       = transforms.skew;

        switch (String(type).toLowerCase()) {
            case Mocks.ArtCanvas.Transform.TRANSLATE :
                if (amounts.length < 2) {
                    break;
                }

                var dx = parseFloat(amounts[0]);
                var dy = parseFloat(amounts[1]);

                if (isNaN(dx) || isNaN(dy)) {
                    break;
                }

                translates.x = dx;
                translates.y = dy;

                break;
            case Mocks.ArtCanvas.Transform.SCALE :
                if (amounts.length < 2) {
                    break;
                }

                var sx = parseFloat(amounts[0]);
                var sy = parseFloat(amounts[1]);

                if (isNaN(sx) || isNaN(sy)) {
                    break;
                }

                scales.x = sx;
                scales.y = sy;

                break;
            case Mocks.ArtCanvas.Transform.ROTATE :
                if (amounts.length < 1) {
                    break;
                }

                var degree = parseFloat(amounts[0]);

                if (isNaN(degree)) {
                    break;
                }

                transforms.rotate = (degree * Math.PI) / 180;

                break;
            default :
                break;
        }

        var rotate       = transforms.rotate;
        var rotateMatrix = [
             Math.cos(rotate), Math.sin(rotate),
            -Math.sin(rotate), Math.cos(rotate),
                            0,                0
        ];

        this.clear();
        this.context.save();

        switch (String(type).toLowerCase()) {
            case Mocks.ArtCanvas.Transform.TRANSLATE :
            case Mocks.ArtCanvas.Transform.SCALE     :
                this.context.setTransform(1, 0, 0, 1, 0, 0);
                this.context.transform(1, 0, 0, 1, centerX, centerY);
                this.context.transform.apply(this.context, rotateMatrix);
                this.context.transform(1, 0, 0, 1, -centerX, -centerY);

                this.context.transform(scales.x, 0, 0, scales.y, translates.x, translates.y);

                break;
            case Mocks.ArtCanvas.Transform.ROTATE :
                this.context.setTransform(1, 0, 0, 1, 0, 0);
                this.context.transform(scales.x, 0, 0, scales.y, translates.x, translates.y);

                this.context.transform(1, 0, 0, 1, centerX, centerY);
                this.context.transform.apply(this.context, rotateMatrix);
                this.context.transform(1, 0, 0, 1, -centerX, -centerY);

                break;
            default :
                break;
        }

        if (arguments.length > 1) {
            this.draw(false);
            this.context.restore();
        }

        return this;
    };

    /**
     * This method clears canvas.
     * @return {Canvas} This is returned for method chain.
     */
    Canvas.prototype.clear = function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        return this;
    };

    /**
     * This method clears the all of stored objects.
     * @return {Canvas} This is returned for method chain.
     */
    Canvas.prototype.clearPaths = function() {
        this.paths.length = 0;
        return this;
    };

    /**
     * This method executes undo.
     * @return {boolean} If undo is executed, this value is true. Otherwise, this value is false.
     */
    Canvas.prototype.undo = function() {
        if (this.historyPointer > 0) {
            this.historyPointer--;
            this.clear();
            this.draw(true);

            return true;
        }

        return false;
    };

    /**
     * This method executes redo.
     * @return {boolean} If redo is executed, this value is true. Otherwise, this value is false.
     */
    Canvas.prototype.redo = function() {
        if (this.historyPointer < this.paths.length) {
            this.historyPointer++;
            this.clear();
            this.draw(true);

            return true;
        }

        return false;
    };

    /**
     * This method gets fill color.
     * @return {string} This is returned as fill color.
     */
    Canvas.prototype.getFillStyle = function() {
        return this.context.fillStyle;
    };

    /**
     * This method sets fill color.
     * @param {string} fillStyle This argument is string for color.
     * @param {boolean} redraw This argument is in order to determine whether or not to redraw.
     * @return {Canvas} This is returned for method chain.
     */
    Canvas.prototype.setFillStyle = function(fillStyle, redraw) {
        this.context.fillStyle = String(fillStyle);

        if ((redraw === undefined) || Boolean(redraw)) {
            this.draw(true);
        }

        return this;
    };

    /**
     * This method gets stroke color.
     * @return {string} This is returned as stroke color.
     */
    Canvas.prototype.getStrokeStyle = function() {
        return this.context.strokeStyle;
    };

    /**
     * This method sets stroke color.
     * @param {string} strokeStyle This argument is string for color.
     * @param {boolean} redraw This argument is in order to determine whether or not to redraw.
     * @return {Canvas} This is returned for method chain.
     */
    Canvas.prototype.setStrokeStyle = function(strokeStyle, redraw) {
        this.context.strokeStyle = String(strokeStyle);

        if ((redraw === undefined) || Boolean(redraw)) {
            this.draw(true);
        }

        return this;
    };

    /**
     * This method gets line width.
     * @return {number} This is returned as line width.
     */
    Canvas.prototype.getLineWidth = function() {
        return this.context.lineWidth;
    };

    /**
     * This method sets line width.
     * @param {number} lineWidth This argument is line width.
     * @param {boolean} redraw This argument is in order to determine whether or not to redraw.
     * @return {Canvas} This is returned for method chain.
     */
    Canvas.prototype.setLineWidth = function(lineWidth, redraw) {
        var w = parseFloat(lineWidth);

        if (w > 0) {
            this.context.lineWidth = w;

            if ((redraw === undefined) || Boolean(redraw)) {
                this.draw(true);
            }
        }

        return this;
    };

    /**
     * This method gets line cap.
     * @return {string} This is one of 'butt', 'round', 'square'.
     */
    Canvas.prototype.getLineCap = function() {
        return this.context.lineCap;
    };

    /**
     * This method sets line cap.
     * @param {string} lineCap This argument is one of 'butt', 'round', 'square'.
     * @param {boolean} redraw This argument is in order to determine whether or not to redraw.
     * @return {Canvas} This is returned for method chain.
     */
    Canvas.prototype.setLineCap = function(lineCap, redraw) {
        if (!/butt|round|square/i.test(String(lineCap))) {
            return this;
        }

        this.context.lineCap = lineCap.toLowerCase();

        if ((redraw === undefined) || Boolean(redraw)) {
            this.draw(true);
        }

        return this;
    };

    /**
     * This method gets line join.
     * @return {string} This is one of 'bevel', 'round', 'miter'.
     */
    Canvas.prototype.getLineJoin = function() {
        return this.context.lineJoin;
    };

    /**
     * This method sets line join.
     * @param {string} lineJoin This argument is one of 'bevel', 'round', 'miter'.
     * @param {boolean} redraw This argument is in order to determine whether or not to redraw.
     * @return {Canvas} This is returned for method chain.
     */
    Canvas.prototype.setLineJoin = function(lineJoin, redraw) {
        if (!/bevel|round|miter/i.test(String(lineJoin))) {
            return this;
        }

        this.context.lineJoin = lineJoin.toLowerCase();

        if ((redraw === undefined) || Boolean(redraw)) {
            this.draw(true);
        }

        return this;
    };

    /**
     * This method gets shadow color.
     * @return {string} This is returned as shadow color.
     */
    Canvas.prototype.getShadowColor = function() {
        return this.context.shadowColor;
    };

    /**
     * This method sets shadow color.
     * @param {string} shadowColor This argument is string for color.
     * @param {boolean} redraw This argument is in order to determine whether or not to redraw.
     * @return {Canvas} This is returned for method chain.
     */
    Canvas.prototype.setShadowColor = function(shadowColor, redraw) {
        this.context.shadowColor = String(shadowColor);

        if ((redraw === undefined) || Boolean(redraw)) {
            this.draw(true);
        }

        return this;
    };

    /**
     * This method gets shadow blur.
     * @return {string} This is returned as shadow blur.
     */
    Canvas.prototype.getShadowBlur = function() {
        return this.context.shadowBlur;
    };

    /**
     * This method sets shadow blur.
     * @param {number} shadowBlur This argument is shadow blur.
     * @param {boolean} redraw This argument is in order to determine whether or not to redraw.
     * @return {Canvas} This is returned for method chain.
     */
    Canvas.prototype.setShadowBlur = function(shadowBlur, redraw) {
        var b = parseFloat(shadowBlur);

        if (b >= 0) {
            this.context.shadowBlur = b;

            if ((redraw === undefined) || Boolean(redraw)) {
                this.draw(true);
            }
        }

        return this;
    };

    /**
     * This method gets horizontal shadow offset.
     * @return {number} This is returned as horizontal shadow offset.
     */
    Canvas.prototype.getShadowOffsetX = function() {
        return this.context.shadowOffsetX;
    };

    /**
     * This method sets horizontal shadow offset.
     * @param {number} offsetX This argument is horizontal shadow offset.
     * @param {boolean} redraw This argument is in order to determine whether or not to redraw.
     * @return {Canvas} This is returned for method chain.
     */
    Canvas.prototype.setShadowOffsetX = function(offsetX, redraw) {
        var x = parseFloat(offsetX);

        if (!isNaN(x)) {
            this.context.shadowOffsetX = x;

            if ((redraw === undefined) || Boolean(redraw)) {
                this.draw(true);
            }
        }

        return this;
    };

    /**
     * This method gets vertical shadow offset.
     * @return {number} This is returned as vertical shadow offset.
     */
    Canvas.prototype.getShadowOffsetY = function() {
        return this.context.shadowOffsetY;
    };

    /**
     * This method sets vertical shadow offset.
     * @param {number} offsetY This argument is vertical shadow offset.
     * @param {boolean} redraw This argument is in order to determine whether or not to redraw.
     * @return {Canvas} This is returned for method chain.
     */
    Canvas.prototype.setShadowOffsetY = function(offsetY, redraw) {
        var y = parseFloat(offsetY);

        if (!isNaN(y)) {
            this.context.shadowOffsetY = y;

            if ((redraw === undefined) || Boolean(redraw)) {
                this.draw(true);
            }
        }

        return this;
    };

    /**
     * This method gets (global) alpha.
     * @return {number} This is returned as (global) alpha.
     */
    Canvas.prototype.getGlobalAlpha = function() {
        return this.context.globalAlpha;
    };

    /**
     * This method sets (global) alpha.
     * @param {number} alpha This argument is between 0 and 1.
     * @param {boolean} redraw This argument is in order to determine whether or not to redraw.
     * @return {Canvas} This is returned for method chain.
     */
    Canvas.prototype.setGlobalAlpha = function(alpha, redraw) {
        var a = parseFloat(alpha);

        if ((a >= 0) && (a <= 1)) {
            this.context.globalAlpha = a;

            if ((redraw === undefined) || Boolean(redraw)) {
                this.draw(true);
            }
        }

        return this;
    };

    /**
     * This method calculates relative horizontal coordinate on canvas from event object.
     * @param {Event} event This argument is to get coordinates at cursor.
     * @return {number} This is returned as relative horizontal coordinate on canvas.
     */
    Canvas.prototype.getOffsetX = function(event) {
        if (!(event instanceof Event)) {
            return 0;
        }

        if (event.pageX) {
            // Desktop
        } else if (event.touches[0]) {
            event = event.touches[0];         // Touch Panel
        } else if (event.changedTouches[0]) {
            event = event.changedTouches[0];  // Touch Panel
        }

        var scrollLeft = this.container.scrollLeft;
        var offsetX    = event.pageX - this.container.offsetLeft + scrollLeft;

        var w = this.canvas.width;

        if (offsetX < 0) {offsetX = 0;}
        if (offsetX > w) {offsetX = w;}

        return offsetX;
    };

    /**
     * This method calculates relative vertical coordinate on canvas from event object.
     * @param {Event} event This argument is to get coordinates at cursor.
     * @return {number} This is returned as relative vertical coordinate on canvas.
     */
    Canvas.prototype.getOffsetY = function(event) {
        if (!(event instanceof Event)) {
            return 0;
        }

        if (event.pageY) {
            // Desktop
        } else if (event.touches[0]) {
            event = event.touches[0];         // Touch Panel
        } else if (event.changedTouches[0]) {
            event = event.changedTouches[0];  // Touch Panel
        }

        var scrollTop = this.container.scrollTop;
        var offsetY   = event.pageY - this.container.offsetTop + scrollTop;

        var h = this.canvas.height;

        if (offsetY < 0) {offsetY = 0;}
        if (offsetY > h) {offsetY = h;}

        return offsetY;
    };

    /**
     * This method calculates center point of drawn object.
     * @return {Point} This is returned as the instance of Point for center point of drawn object.
     */
    Canvas.prototype.getCenterPoint = function() {
        var point = null;

        for (var i = 0; i < this.historyPointer; i++) {
            var paths = this.paths[i];

            if (Array.isArray(paths)) {
                var minX = Number.MAX_VALUE;
                var minY = Number.MAX_VALUE;
                var maxX = 0;
                var maxY = 0;

                for (var j = 0, num = paths.length; j < num; j++) {
                    var path = paths[j];
                    var x    = path.getX();
                    var y    = path.getY();

                    if (x < minX) {minX = x;}
                    if (y < minY) {minY = y;}
                    if (x > maxX) {maxX = x;}
                    if (y > maxY) {maxY = y;}
                }

                var centerX = Math.floor(((maxX - minX) / 2) + minX);
                var centerY = Math.floor(((maxY - minY) / 2) + minY);

                point = new Mocks.ArtCanvas.Point(centerX, centerY);
            } else if (paths instanceof Mocks.ArtCanvas.Drawable) {
                point = paths.getCenterPoint(this.context);
            }
        }

        return point;
    };

    /**
     * This method creates textbox on canvas.
     * @param {Point} point This argument is textbox position.
     * @return {HTMLInputElement} This argument is returned as the instance of HTMLInputElement.
     */
    Canvas.prototype.createTextbox = function(point) {
        if (!(point instanceof Mocks.ArtCanvas.Point)) {
            return this;
        }

        // Already exists ?
        if (this.container.querySelector('[type="text"]') instanceof HTMLInputElement) {
            return this;
        }

        var x = point.getX();
        var y = point.getY();

        var textbox = document.createElement('input');

        textbox.setAttribute('type', 'text');

        textbox.style.position   = 'absolute';
        textbox.style.top        = y + 'px';
        textbox.style.left       = x + 'px';
        textbox.style.zIndex     = parseInt(this.canvas.style.zIndex) + 1;
        textbox.style.outline    = 'none';
        // textbox.style.fontFamily = fontFamily;
        // textbox.style.fontStyle  = fontStyle;
        // textbox.style.fontSize   = fontSize;
        textbox.style.padding    = '0.5em';

        this.container.appendChild(textbox);

        return textbox;
    };

    /**
     * This method picks the color information of designated point.
     * @param {Event} event This argument is event object.
     * @return {Color} This is returned as the intance of Color.
     */
    Canvas.prototype.pickColor = function(event) {
        if (!(event instanceof Event)) {
            return new Mocks.ArtCanvas.Color(0, 0, 0, 1.0);
        }

        var picks = this.context.getImageData(this.getOffsetX(event), this.getOffsetY(event), 1, 1);
        var color = new Mocks.ArtCanvas.Color(picks.data[0], picks.data[1], picks.data[2], (picks.data[3] / 255));

        return color;
    };

    /**
     * This method fills the enclosed part.
     * @param {Event} event This argument is event object.
     * @param {Color} color This argument is the instance of Color.
     * @return {Canvas} This is returned for method chain.
     */
    Canvas.prototype.fill = function(event, color) {
        if (!(event instanceof Event)) {
            return;
        }

        if (!(color instanceof Mocks.ArtCanvas.Color)) {
            return;
        }

        var width  = this.canvas.width;
        var height = this.canvas.height;

        var imagedata = this.context.getImageData(0, 0, width, height);

        var startX = this.getOffsetX(event);
        var startY = this.getOffsetY(event);

        var getPixelPosition = function(x, y) {
            return ((width * y) + x) * 4;
        };

        var setPixelPosition = function(imagedata, position, color) {
            imagedata.data[position    ] = color.getRed();
            imagedata.data[position + 1] = color.getGreen();
            imagedata.data[position + 2] = color.getBlue();
            imagedata.data[position + 3] = color.getAlpha() * 255;
        };

        var isMatchColor = function(x, y, color) {
            var position = getPixelPosition(x, y);

            if (imagedata.data[position] !== color.getRed()) {
                return false;
            } else if (imagedata.data[position + 1] !== color.getGreen()) {
                return false;
            } else if (imagedata.data[position + 2] !== color.getBlue()) {
                return false;
            } else if (imagedata.data[position + 3] !== color.getAlpha()) {
                return false;
            } else {
                return true;
            }
        };

        var paintHorizon = function(left, right, y) {
            for (var x = left; x <= right; x++) {
                var position = getPixelPosition(x, y);
                setPixelPosition(imagedata, position, color);
            }
        };

        var scanHorizon = function(left, right, y, buffer, baseColor) {
            while (left <= right) {
                while (left <= right) {
                    if (isMatchColor(left, y, baseColor)) {
                        break;
                    } else {
                        left++;
                    }
                }

                if (left > right) {
                    break;
                }

                while (left <= right) {
                    if (isMatchColor(left, y, baseColor)) {
                        left++;
                    } else {
                        break;
                    }
                }

                buffer.push({x : (left - 1), y : y});
            }
        };

        var startPixelPosition = getPixelPosition(startX, startY);

        var baseColor = new Mocks.ArtCanvas.Color(
            imagedata.data[startPixelPosition],
            imagedata.data[startPixelPosition + 1],
            imagedata.data[startPixelPosition + 2],
            imagedata.data[startPixelPosition + 3]
        );

        if (isMatchColor(startX, startY, color)) {
            this.context.putImageData(imagedata, 0, 0);
            return;
        }

        var buffer = [];
        buffer.push({x : startX, y : startY});

        while (buffer.length > 0) {
            var positions = buffer.pop();

            var left  = positions.x;
            var right = positions.x;

            if (isMatchColor(positions.x, positions.y, color)) {
                continue;
            }

            // -> left
            while (0 < left) {
                if (isMatchColor((left - 1), positions.y, baseColor)) {
                    left--;
                } else {
                    break;
                }
            }

            // -> right
            while (right < (this.canvas.width - 1)) {
                if (isMatchColor((right + 1), positions.y, baseColor)) {
                    right++;
                } else {
                    break;
                }
            }

            paintHorizon(left, right, positions.y);

            if ((positions.y + 1) < height) {scanHorizon(left, right, (positions.y + 1), buffer, baseColor);}
            if ((positions.y - 1) >= 0)     {scanHorizon(left, right, (positions.y - 1), buffer, baseColor);}
        }

        this.context.putImageData(imagedata, 0, 0);

        return this;
    };

    /**
     * This method runs image filter.
     * @param {string} type This argument is image filter type.
     * @param {Array.<number>} amounts This argument is the array that contains amount for image filter.
     * @return {Canvas} This is returned for method chain.
     */
    Canvas.prototype.filter = function(type, amounts) {
        var filter = new Mocks.ArtCanvas.Filter(type, amounts);

        filter.filter(this);

        this.paths.push(filter);
        this.increaseHistoryPointer();

        return this;
    };

    // Export
    global.Canvas = Canvas;

})(window);
