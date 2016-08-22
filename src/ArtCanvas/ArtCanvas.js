(function(global) {
    'use strict';

    /**
     * This class can be used as global object.
     * This class has classes that are defined by "ArtCanvas.js" as class property.
     * This class manages data for drawing. For example, Layer, Canvas, Application Status ...etc
     * This class defines accessor methods as facade.
     * @param {HTMLElement} container This argument is the instance of HTMLElement for wrapping HTMLCanvasElements.
     * @param {HTMLCanvasElement} canvas This argument is the instance of HTMLCanvasElement as the first layer.
     * @param {number} width This argument is canvas width. The default value is 300 (px).
     * @param {number} height This argument is canvas height. The default value is 300 (px).
     * @param {Object.<string, function>} callbacks This argument is associative array that has callback functions.
     * @constructor
     */
    function ArtCanvas(container, canvas, width, height, callbacks) {
        this.container = document.body;

        if (container instanceof HTMLElement) {
            this.container = container;
        }

        // Set CSS properties for piling HTMLCanvasElements up
        this.container.style.position = 'relative';
        this.container.style.top      = '0px';
        this.container.style.left     = '0px';
        this.container.style.zIndex   = 1;

        var w = parseInt(width);
        var h = parseInt(height);

        this.container.style.width  = (w > 0) ? (w + 'px') : (ArtCanvas.DEFAULT_SIZES.WIDTH  + 'px');
        this.container.style.height = (h > 0) ? (h + 'px') : (ArtCanvas.DEFAULT_SIZES.HEIGHT + 'px');

        this.mode      = Mocks.ArtCanvas.Mode.HAND;
        this.figure    = Mocks.ArtCanvas.Figure.RECTANGLE;
        this.textStyle = new Mocks.ArtCanvas.TextStyle(new Mocks.ArtCanvas.Font('Arial', '16px', 'normal', 'normal'), new Mocks.ArtCanvas.Color(0, 0, 0, 1.0).toString());
        this.transform = Mocks.ArtCanvas.Transform.TRANSLATE;

        /** {@type Array.<Canvas>} */
        this.layers = [];
        this.layers.push(new Mocks.ArtCanvas.Canvas(this.container, canvas, width, height, (this.layers.length + 2)));

        this.activeLayer = 0;

        /** {@type Object.<string, function>} */
        this.callbacks = {
            drawstart : function() {},
            drawmove  : function() {},
            drawend   : function() {}
        };

        this.setCallbacks(callbacks);

        var imagedata = null;
        var isDown    = false;
        var self      = this;

        /**
         * This private method draws figure (Rectangle, Circle, Line ...etc).
         * @param {Canvas} activeCanvas This argument is the instance of Canvas in the target layer.
         * @param {CanvasRenderingContext2D} activeContext This argument is the instance of CanvasRenderingContext2D in the target layer.
         * @param {string} type This argument is event type.
         * @param {number} x This argument is relative horizontal position in HTMLCanvasElements.
         * @param {number} y This argument is relative vertical position in HTMLCanvasElements.
         */
        var _figure = function(activeCanvas, activeContext, type, x, y) {
            if (/mousedown|touchstart/i.test(type)) {
                var canvasElement = activeCanvas.getCanvas();
                var width         = canvasElement.width;
                var height        = canvasElement.height;
                imagedata         = activeContext.getImageData(0, 0, width, height);

                return;
            }

            var points = activeCanvas.popPath();
            var point  = points.pop();

            points.push(point);
            activeCanvas.pushPath(points);

            activeContext.putImageData(imagedata, 0, 0);

            switch (self.figure) {
                case Mocks.ArtCanvas.Figure.RECTANGLE :
                    var left   = point.getX();
                    var top    = point.getY();
                    var offset = ArtCanvas.Point.getOffsetPoint(point, new ArtCanvas.Point(x, y));

                    activeContext.beginPath();
                    activeContext.rect(left, top, offset.getX(), offset.getY());
                    activeContext.stroke();
                    activeContext.fill();

                    if (/mouseup|touchend/i.test(type)) {
                        activeCanvas.popPath();
                        activeCanvas.pushPath(new ArtCanvas.Rectangle(left, top, offset.getX(), offset.getY()));
                    }

                    break;
                case Mocks.ArtCanvas.Figure.CIRCLE :
                    var centerX = point.getX();
                    var centerY = point.getY();
                    var radius  = ArtCanvas.Point.getDistance(point, new ArtCanvas.Point(x, y));

                    activeContext.beginPath();
                    activeContext.arc(centerX, centerY, radius, 0, (2 * Math.PI), false);
                    activeContext.stroke();
                    activeContext.fill();

                    if (/mouseup|touchend/i.test(type)) {
                        activeCanvas.popPath();
                        activeCanvas.pushPath(new ArtCanvas.Circle(centerX, centerY, radius, 0, (2 * Math.PI), false));
                    }

                    break;
                case Mocks.ArtCanvas.Figure.LINE :
                    activeContext.beginPath();
                    activeContext.moveTo(point.getX(), point.getY());
                    activeContext.lineTo(x, y);
                    activeContext.stroke();

                    if (/mouseup|touchend/i.test(type)) {
                        activeCanvas.popPath();
                        activeCanvas.pushPath(new ArtCanvas.Line(point, new ArtCanvas.Point(x, y)));
                    }

                    break;
                default :
                    break;
            }
        };

        /**
         * This private method is facade method for transforms (translate, scale rotate ...etc).
         * @param {Canvas} activeCanvas This argument is the instance of Canvas in the target layer.
         * @param {number} x This argument is relative horizontal position in HTMLCanvasElements.
         * @param {number} y This argument is relative vertical position in HTMLCanvasElements.
         */
        var _transform = function(activeCanvas, x, y) {
            var points = activeCanvas.popPath();
            var point  = points.pop();
            var offset = ArtCanvas.Point.getOffsetPoint(point, new ArtCanvas.Point(x, y));

            var amounts = [];

            switch (self.transform) {
                case Mocks.ArtCanvas.Transform.TRANSLATE :
                    amounts.push(offset.getX());
                    amounts.push(offset.getY());
                    break;
                case Mocks.ArtCanvas.Transform.SCALE :
                    var canvas = activeCanvas.getCanvas();

                    var scaleX = 1;
                    var scaleY = 1;

                    var offsetX = offset.getX();
                    var offsetY = offset.getY();

                    if (offsetX !== 0) {scaleX += (offsetX / canvas.width);}
                    if (offsetY !== 0) {scaleY += (offsetY / canvas.height);}

                    amounts.push(scaleX);
                    amounts.push(scaleY);
                    break;
                case Mocks.ArtCanvas.Transform.ROTATE :
                    var radian = Math.atan2(offset.getY(), offset.getX());
                    var degree = (radian / Math.PI) * 180;

                    amounts.push(degree);
                    break;
                default :
                    break;
            }

            activeCanvas.transform(self.transform, amounts);

            points.push(point);
            activeCanvas.pushPath(points);
        };

        this.container.addEventListener(Mocks.ArtCanvas.MouseEvents.START, function(event) {
            if (self.mode === ArtCanvas.Mode.TOOL) {
                return;
            }

            var activeCanvas  = self.layers[self.activeLayer];
            var activeContext = activeCanvas.getContext();

            if (self.mode === ArtCanvas.Mode.ERASER) {
                activeContext.globalCompositeOperation = 'destination-out';
            } else {
                activeContext.globalCompositeOperation = 'source-over';
            }

            var x = activeCanvas.getOffsetX(event);
            var y = activeCanvas.getOffsetY(event);

            switch (self.mode) {
                case Mocks.ArtCanvas.Mode.HAND   :
                case MOcks.ArtCanvas.Mode.ERASER :
                    activeContext.beginPath();
                    activeContext.moveTo(x, y);
                    break;
                case Mocks.ArtCanvas.Mode.FIGURE :
                    _figure(activeCanvas, activeContext, event.type, x, y);
                    break;
                case Mocks.ArtCanvas.Mode.TEXT :
                    activeCanvas.createTextbox(new ArtCanvas.Point(x, y));
                    return;
                case Mocks.ArtCanvas.Mode.TRANSFORM :
                    break;
                default :
                    break;
            }

            activeCanvas.pushPath([new ArtCanvas.Point(x, y)]);

            isDown = true;

            self.callbacks.drawstart(activeCanvas, activeContext, x, y);
        }, true);

        this.container.addEventListener(Mocks.ArtCanvas.MouseEvents.MOVE, function(event) {
            if (!isDown) {
                return;
            }

            // for Touch Panel
            event.preventDefault();

            var activeCanvas  = self.layers[self.activeLayer];
            var activeContext = activeCanvas.getContext();

            var x = activeCanvas.getOffsetX(event);
            var y = activeCanvas.getOffsetY(event);

            switch (self.mode) {
                case Mocks.ArtCanvas.Mode.HAND   :
                case Mocks.ArtCanvas.Mode.ERASER :
                    var points = activeCanvas.popPath();
                    var point  = points.pop();

                    activeContext.beginPath();
                    activeContext.moveTo(point.getX(), point.getY());
                    activeContext.lineTo(x, y);
                    activeContext.stroke();

                    points.push(point);

                    switch (self.mode) {
                        case ArtCanvas.Mode.HAND :
                            points.push(new ArtCanvas.Point(x, y));
                            break;
                        case ArtCanvas.Mode.ERASER :
                            points.push(new ArtCanvas.Eraser(new ArtCanvas.Point(x, y)));
                            break;
                        default :
                            break;
                    }

                    activeCanvas.pushPath(points);
                    break;
                case Mocks.ArtCanvas.Mode.TEXT :
                    break;
                case Mocks.ArtCanvas.Mode.FIGURE :
                    _figure(activeCanvas, activeContext, event.type, x, y);
                    break;
                case Mocks.ArtCanvas.Mode.TRANSFORM :
                    _transform(activeCanvas, x, y);
                    break;
                default :
                    break;
            }

            self.callbacks.drawmove(activeCanvas, activeContext, x, y);
        }, true);

        global.addEventListener(Mocks.ArtCanvas.MouseEvents.END, function(event) {
            if (!isDown) {
                return;
            }

            var activeCanvas  = self.layers[self.activeLayer];
            var activeContext = activeCanvas.getContext();

            var x = activeCanvas.getOffsetX(event);
            var y = activeCanvas.getOffsetY(event);

            switch (self.mode) {
                case Mocks.ArtCanvas.Mode.HAND :
                    break;
                case Mocks.ArtCanvas.Mode.ERASER :
                    activeContext.globalCompositeOperation = 'source-over';
                    break;
                case Mocks.ArtCanvas.Mode.FIGURE :
                    _figure(activeCanvas, activeContext, event.type, x, y);
                    imagedata = null;
                    break;
                case Mocks.ArtCanvas.Mode.TEXT :
                    break;
                case Mocks.ArtCanvas.Mode.TRANSFORM :
                    activeCanvas.popPath();
                    break;
                default :
                    break;
            }

            isDown = false;

            activeCanvas.increaseHistoryPointer();

            self.callbacks.drawend(activeCanvas, activeContext, x, y);
        }, true);

    }

    /** Constant values as class properties (static properties) */
    ArtCanvas.DEFAULT_SIZES        = {};
    ArtCanvas.DEFAULT_SIZES.WIDTH  = 300;
    ArtCanvas.DEFAULT_SIZES.HEIGHT = 300;

    /**
     * This method is getter for container width for drawing.
     * @return {number} This is returned as container width for drawing.
     */
    ArtCanvas.prototype.getContainerWidth = function() {
        return parseInt(this.container.style.width);
    };

    /**
     * This method is getter for container height for drawing.
     * @return {number} This is returned as container height for drawing.
     */
    ArtCanvas.prototype.getContainerHeight = function() {
        return parseInt(this.container.style.height);
    };

    /**
     * This method registers callbacks.
     * @param {Object.<string, function>} callbacks This argument is associative array that has callback functions.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setCallbacks = function(callbacks) {
        if (Object.prototype.toString.call(callbacks) !== '[object Object]') {
            return this;
        }

        for (var key in callbacks) {
            if ((key in this.callbacks) && (Object.prototype.toString.call(callbacks[key]) === '[object Function]')) {
                this.callbacks[key] = callbacks[key];
            }
        }

        return this;
    };

    /**
     * This method is getter for string that is defined by Mode class.
     * @return {string} This is returned as string that is defined by Mode class.
     */
    ArtCanvas.prototype.getMode = function() {
        return this.mode;
    };

    /**
     * This method is setter for string that is defined by Mode class.
     * @param {string} mode This argument is string that is defined by Mode class.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setMode = function(mode) {
        var m = String(mode).toLowerCase();

        switch (m) {
            case Mocks.ArtCanvas.Mode.HAND      :
            case Mocks.ArtCanvas.Mode.FIGURE    :
            case Mocks.ArtCanvas.Mode.ERASER    :
            case Mocks.ArtCanvas.Mode.TRANSFORM :
            case Mocks.ArtCanvas.Mode.TOOL      :
                this.mode = m;
                break;
            case Mocks.ArtCanvas.Mode.TEXT      :
                this.mode = m;
                this.addLayer(this.getContainerWidth(), this.getContainerHeight());
                break;
            default :
                break;
        }

        var canvas = this.layers[this.activeLayer];
        canvas.drawText(this.textStyle);

        return this;
    };

    /**
     * This method gets active layer number.
     * @return {number} This is returned as active layer number.
     */
    ArtCanvas.prototype.getActiveLayer = function() {
        return this.activeLayer;
    };

    /**
     * This method validates the designated layer number.
     * @param {number} layerNumber This argument is layer number from 0.
     * @return {boolean} If the designated number is valid, this value is true. Otherwise, this value is false.
     */
    ArtCanvas.prototype.validateLayerNumber = function(layerNumber) {
        var n = parseInt(layerNumber);

        return (n >= 0) && (n < this.layers.length);
    };

    /**
     * This method selects the target layer.
     * @param {number} layerNumber This argument is layer number from 0.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.selectLayer = function(layerNumber) {
        if (this.validateLayerNumber(layerNumber)) {
            var n = parseInt(layerNumber);

            this.activeLayer = n;
        }

        return this;
    };

    /**
     * This method shows the designated layer.
     * @param {number} layerNumber This argument is layer number from 0.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.showLayer = function(layerNumber) {
        if (this.validateLayerNumber(layerNumber)) {
            var n             = parseInt(layerNumber);
            var canvas        = this.layers[n];
            var canvasElement = canvas.getCanvas();

            canvasElement.style.visibility = 'visible';
        }

        return this;
    };

    /**
     * This method hides the designated layer.
     * @param {number} layerNumber This argument is layer number from 0.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.hideLayer = function(layerNumber) {
        if (this.validateLayerNumber(layerNumber)) {
            var n             = parseInt(layerNumber);
            var canvas        = this.layers[n];
            var canvasElement = canvas.getCanvas();

            canvasElement.style.visibility = 'hidden';
        }

        return this;
    };

    /**
     * This method creates new layer.
     * @param {number} width This argument is canvas width.
     *     If this argument is omitted, the width that is designated constructor is used.
     * @param {number} height This argument is canvas height.
     *     If this argument is omitted, the height that is designated constructor is used.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.addLayer = function(width, height) {
        this.layers.push(new Mocks.ArtCanvas.Canvas(this.container, null, width, height, (this.layers.length + 2)));
        this.activeLayer = this.layers.length - 1;

        return this;
    };

    /**
     * This method removes the designated layer and deletes the instance of Canvas in the designated layer.
     * @param {number} layerNumber This argument is layer number from 0.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.removeLayer = function(layerNumber) {
        if ((this.layers.length > 1) && this.validateLayerNumber(layerNumber)) {
            var n             = parseInt(layerNumber);
            var canvas        = this.layers[n];
            var canvasElement = canvas.getCanvas();

            // for GC
            this.layers.splice(n, 1);
            canvasElement.parentNode.removeChild(canvasElement);

            if ((this.activeLayer > 0) && (n <= this.activeLayer)) {
                this.activeLayer--;
            }
        }

        return this;
    };

    /**
     * This method executes undo in the target layer.
     * @return {boolean} If undo is executed, this value is true. Otherwise, this value is false.
     */
    ArtCanvas.prototype.undo = function() {
        var canvas = this.layers[this.activeLayer];
        return canvas.undo();
    };

    /**
     * This method executes redo in the target layer.
     * @return {boolean} If redo is executed, this value is true. Otherwise, this value is false.
     */
    ArtCanvas.prototype.redo = function() {
        var canvas = this.layers[this.activeLayer];
        return canvas.redo();
    };

    /**
     * This method clears canvas in the target layer.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.clear = function() {
        var canvas = this.layers[this.activeLayer];
        canvas.clear();
        return this;
    };

    /**
     * This method gets fill color to HTMLCanvasElement in the target layer.
     * @return {string} This is returned as fill color to HTMLCanvasElement in the target layer.
     */
    ArtCanvas.prototype.getFillStyle = function() {
        var canvas    = this.layers[this.activeLayer];
        var fillStyle = canvas.getFillStyle();

        return fillStyle;
    };

    /**
     * This method sets fill color to HTMLCanvasElement in the target layer.
     * @param {string} fillStyle This argument is string for color.
     * @param {boolean} redraw This argument is in order to determine whether or not to redraw.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setFillStyle = function(fillStyle, redraw) {
        var canvas = this.layers[this.activeLayer];
        canvas.setFillStyle(fillStyle, redraw);

        return this;
    };

    /**
     * This method gets stroke color to HTMLCanvasElement in the target layer.
     * @return {string} This is returned as stroke color to HTMLCanvasElement in the target layer.
     */
    ArtCanvas.prototype.getStrokeStyle = function() {
        var canvas      = this.layers[this.activeLayer];
        var strokeStyle = canvas.getStrokeStyle();

        return strokeStyle;
    };

    /**
     * This method sets stroke color to HTMLCanvasElement in the target layer.
     * @param {string} strokeStyle This argument is string for color.
     * @param {boolean} redraw This argument is in order to determine whether or not to redraw.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setStrokeStyle = function(strokeStyle, redraw) {
        var canvas = this.layers[this.activeLayer];
        canvas.setStrokeStyle(strokeStyle, redraw);

        return this;
    };

    /**
     * This method gets line width to HTMLCanvasElement in the target layer.
     * @return {number} This is returned as line width to HTMLCanvasElement in the target layer.
     */
    ArtCanvas.prototype.getLineWidth = function() {
        var canvas    = this.layers[this.activeLayer];
        var lineWidth = canvas.getLineWidth();

        return lineWidth;
    };

    /**
     * This method sets line width to HTMLCanvasElement in the target layer.
     * @param {number} lineWidth This argument is number for line width.
     * @param {boolean} redraw This argument is in order to determine whether or not to redraw.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setLineWidth = function(lineWidth, redraw) {
        var canvas = this.layers[this.activeLayer];
        canvas.setLineWidth(lineWidth, redraw);

        return this;
    };

    /**
     * This method gets line cap in the target layer.
     * @return {string} This is one of 'butt', 'round', 'square'.
     */
    ArtCanvas.prototype.getLineCap = function() {
        var canvas  = this.layers[this.activeLayer];
        var lineCap = canvas.getLineCap();

        return lineCap;
    };

    /**
     * This method sets line cap in the target layer.
     * @param {string} lineCap This argument is one of 'butt', 'round', 'square'.
     * @param {boolean} redraw This argument is in order to determine whether or not to redraw.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setLineCap = function(lineCap, redraw) {
        var canvas = this.layers[this.activeLayer];
        canvas.setLineCap(lineCap, redraw);

        return this;
    };

    /**
     * This method gets line join in the target layer.
     * @return {string} This is one of 'bevel', 'round', 'miter'.
     */
    ArtCanvas.prototype.getLineJoin = function() {
        var canvas   = this.layers[this.activeLayer];
        var lineJoin = canvas.getLineJoin();

        return lineJoin;
    };

    /**
     * This method sets line join in the target layer.
     * @param {string} lineJoin This argument is one of 'bevel', 'round', 'miter'.
     * @param {boolean} redraw This argument is in order to determine whether or not to redraw.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setLineJoin = function(lineJoin, redraw) {
        var canvas = this.layers[this.activeLayer];
        canvas.setLineJoin(lineJoin, redraw);

        return this;
    };

    /**
     * This method gets shadow color in the target layer.
     * @return {string} This is returned as shadow color.
     */
    ArtCanvas.prototype.getShadowColor = function() {
        var canvas      = this.layers[this.activeLayer];
        var shadowColor = canvas.getShadowColor();

        return shadowColor;
    };

    /**
     * This method sets shadow color in the target layer.
     * @param {string} shadowColor This argument is string for color.
     * @param {boolean} redraw This argument is in order to determine whether or not to redraw.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setShadowColor = function(shadowColor, redraw) {
        var canvas = this.layers[this.activeLayer];
        canvas.setShadowColor(shadowColor, redraw);

        return this;
    };

    /**
     * This method gets shadow blur in the target layer.
     * @return {string} This is returned as shadow blur.
     */
    ArtCanvas.prototype.getShadowBlur = function() {
        var canvas     = this.layers[this.activeLayer];
        var shadowBlur = canvas.getShadowBlur();

        return shadowBlur;
    };

    /**
     * This method sets shadow blur in the target layer.
     * @param {number} shadowBlur This argument is shadow blur.
     * @param {boolean} redraw This argument is in order to determine whether or not to redraw.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setShadowBlur = function(shadowBlur, redraw) {
        var canvas = this.layers[this.activeLayer];
        canvas.setShadowBlur(shadowBlur, redraw);

        return this;
    };

    /**
     * This method gets horizontal shadow offset in the target layer.
     * @return {number} This is returned as horizontal shadow offset.
     */
    ArtCanvas.prototype.getShadowOffsetX = function() {
        var canvas  = this.layers[this.activeLayer];
        var offsetX = canvas.getShadowOffsetX();

        return offsetX;
    };

    /**
     * This method sets horizontal shadow offset in the target layer.
     * @param {number} offsetX This argument is horizontal shadow offset.
     * @param {boolean} redraw This argument is in order to determine whether or not to redraw.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setShadowOffsetX = function(offsetX, redraw) {
        var canvas = this.layers[this.activeLayer];
        canvas.setShadowOffsetX(offsetX, redraw);

        return this;
    };

    /**
     * This method gets vertical shadow offset in the target layer.
     * @return {number} This is returned as vertical shadow offset.
     */
    ArtCanvas.prototype.getShadowOffsetY = function() {
        var canvas = this.layers[this.activeLayer];
        var offsetY = canvas.getShadowOffsetY();

        return offsetY;
    };

    /**
     * This method sets vertical shadow offset in the target layer.
     * @param {number} offsetY This argument is vertical shadow offset.
     * @param {boolean} redraw This argument is in order to determine whether or not to redraw.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setShadowOffsetY = function(offsetY, redraw) {
        var canvas = this.layers[this.activeLayer];
        canvas.setShadowOffsetY(offsetY, redraw);

        return this;
    };

    /**
     * This method gets alpha in the target layer.
     * @return {number} This is returned as alpha.
     */
    ArtCanvas.prototype.getGlobalAlpha = function() {
        var canvas = this.layers[this.activeLayer];
        var alpha  = canvas.getGlobalAlpha();

        return alpha;
    };

    /**
     * This method sets alpha in the target layer.
     * @param {number} alpha This argument is between 0 and 1.
     * @param {boolean} redraw This argument is in order to determine whether or not to redraw.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setGlobalAlpha = function(alpha, redraw) {
        var canvas = this.layers[this.activeLayer];
        canvas.setGlobalAlpha(alpha, redraw);

        return this;
    };

    /**
     * This method is getter for the instance of TextStyle.
     * @return {TextStyle} This is returned as the instance of TextStyle.
     */
    ArtCanvas.prototype.getTextStyle = function() {
        return this.textStyle;
    };

    /**
     * This method is setter for the instance of TextStyle.
     * @param{TextStyle} textStyle This argument is the instance of TextStyle.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setTextStyle = function(textStyle) {
        if (textStyle instanceof ArtCanvas.TextStyle) {
            this.textStyle = textStyle;
        }

        return this;
    };

    /**
     * This method is getter for string that is defined by Figure class.
     * @return {string} This is returned as string that is defined by Figure class.
     */
    ArtCanvas.prototype.getFigure = function() {
        return this.figure;
    };

    /**
     * This method is setter for string that is defined by Figure class.
     * @param {string} figure This argument is string that is defined by Figure class.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setFigure = function(figure) {
        var f = String(figure).toLowerCase();

        switch (f) {
            case ArtCanvas.Figure.RECTANGLE :
            case ArtCanvas.Figure.CIRCLE    :
            case ArtCanvas.Figure.LINE      :
                this.figure = f;
                break;
            default :
                break;
        }

        return this;
    };

    /**
     * This method is getter for string that is defined by Transform class.
     * @return {string} This is returned as string that is defined by Transform class.
     */
    ArtCanvas.prototype.getTransform = function() {
        return this.transform;
    };

    /**
     * This method is setter for string that is defined by Transform class.
     * @param {string} transform This argument is string that is defined by Transform class.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setTransform = function(transform) {
        var t = String(transform).toLowerCase();

        switch (t) {
            case ArtCanvas.Transform.TRANSLATE :
            case ArtCanvas.Transform.SCALE     :
            case ArtCanvas.Transform.ROTATE    :
                this.transform = t;
                break;
            default :
                break;
        }

        return this;
    };

    /**
     * This method translates the drawn objects in the target layer.
     * @param {number} translateX This argument is horizontal translation amount.
     * @param {number} translateY This argument is vertical translation amount.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.translate = function(translateX, translateY) {
        var canvas = this.layers[this.activeLayer];
        canvas.transform(ArtCanvas.Transform.TRANSLATE, [translateX, translateY]);

        return this;
    };

    /**
     * This method scales the drawn objects in the target layer.
     * @param {number} scaleX This argument is horizontal scale rate.
     * @param {number} scaleY This argument is vertical scale rate.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.scale = function(scaleX, scaleY) {
        var canvas = this.layers[this.activeLayer];
        canvas.transform(ArtCanvas.Transform.SCALE, [scaleX, scaleY]);

        return this;
    };

    /**
     * This method rotates the drawn objects in the target layer.
     * @param {number} degree This argument is rotation degrees.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.rotate = function(degree) {
        var canvas = this.layers[this.activeLayer];
        canvas.transform(ArtCanvas.Transform.ROTATE, [degree]);

        return this;
    };

    /**
     * This method draws image in the target layer.
     * @param {string} src This argument is image file path.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.drawImage = function(src) {
        var canvas = this.layers[this.activeLayer];
        canvas.drawImage(src);

        return this;
    };

    /**
     * This method gets the instance of Color in the target point.
     * @param {Event} event This argument is event object.
     * @return {Color} This is returned as the instance of Color.
     */
    ArtCanvas.prototype.pickColor = function(event) {
        var canvas = this.layers[this.activeLayer];
        var color  = canvas.pickColor(event);

        return color;
    };

    /**
     * This method fills the enclosed part in the target layer.
     * @param {Event} event This argument is event object.
     * @param {Color} color This argument is the instance of Color.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.fill = function(event, color) {
        var canvas = this.layers[this.activeLayer];
        canvas.fill(event, color);

        return this;
    };

    /**
     * This method runs image filter in the target layer.
     * @param {string} type This argument is image filter type.
     * @param {Array.<number>} amounts This argument is the array that contains amount for image filter.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.filter = function(type, amounts) {
        var canvas = this.layers[this.activeLayer];
        canvas.filter(type, amounts);
        return this;
    };

    /**
     * This method exports image file by synthesizing layers.
     * @param {string} format This argument is one of 'gif', 'jpeg', 'jpg', 'png'.
     * @param {function} callback This argument is invoked when image file is exported.
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.export = function(format, callback) {
        if (!/gif|jpeg|jpg|png/i.test(String(format))) {
            return this;
        }

        var exportedCanvas  = document.createElement('canvas');
        var exportedContext = exportedCanvas.getContext('2d');

        exportedCanvas.width  = this.getContainerWidth();
        exportedCanvas.height = this.getContainerHeight();

        var canvases     = [];
        var layerPointer = 0;
        var self         = this;

        var draw = function() {
            for (var i = 0, len = canvases.length; i < len; i++) {
                exportedContext.drawImage(canvases[i], 0, 0);
            }

            if (Object.prototype.toString.call(callback) === '[object Function]') {
                callback(exportedCanvas.toDataURL('image/' + format.toLowerCase()));
            }
        };

        var loadImage = function() {
            if (layerPointer >= self.layers.length) {
                draw();
                return;
            }

            var canvas        = self.layers[layerPointer];
            var canvasElement = canvas.getCanvas();

            if (canvasElement.style.visibility !== 'hidden') {
                canvases.push(canvasElement);
            }

            layerPointer++;
            loadImage();
        };

        loadImage();

        return this;
    };

    // Export
    global.ArtCanvas = ArtCanvas;

})(window);
