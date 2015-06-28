/**
 * ArtCanvas.js
 * @fileoverview HTML5 Canvas Library
 *
 * Copyright 2012, 2013, 2014@Tomohiro IKEDA
 * Released under the MIT license
 */
 
 
 
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

        this.mode      = ArtCanvas.Mode.HAND;
        this.figure    = ArtCanvas.Figure.RECTANGLE;
        this.textStyle = new ArtCanvas.TextStyle(new ArtCanvas.Font('Arial', 'normal', '16px'), new ArtCanvas.Color(0, 0, 0, 1.0).toString());
        this.transform = ArtCanvas.Transform.TRANSLATE;

        /** {@type Array.<Canvas>} */
        this.layers = [];
        this.layers.push(new ArtCanvas.Canvas(this.container, canvas, width, height, (this.layers.length + 2)));

        this.activeLayer = 0;

        /** {@type Object.<string, function>} */
        this.callbacks = {
            drawstart   : function() {},
            drawmove    : function() {},
            drawend     : function() {},
            changemode  : function() {},
            selectlayer : function() {},
            showlayer   : function() {},
            hidelayer   : function() {},
            addlayer    : function() {},
            removelayer : function() {}
        };

        this.setCallbacks(callbacks);

        var imagedata = null;
        var isDown    = false;
        var self      = this;

        /**
         * This private method draws figure (Rectangle, Circle, Line ...etc).
         * @param {Canvas} activeCanvas This argument is the instance of Canvas in the target layer.
         * @param {CanvasRenderingContext2D} activeContext This argument is the instance of CanvasRenderingContext2D in the target layer.
         * @param {number} x This argument is relative horizontal position in HTMLCanvasElements.
         * @param {number} y This argument is relative vertical position in HTMLCanvasElements.
         * @param {Event} event This argument is event object to calculate position.
         */
        var _figure = function(activeCanvas, activeContext, x, y, event) {
            if (/mousedown|touchstart/i.test(event)) {
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
                case ArtCanvas.Figure.RECTANGLE :
                    var left   = point.getX();
                    var top    = point.getY();
                    var offset = ArtCanvas.Point.getOffsetPoint(point, new ArtCanvas.Point(x, y));

                    activeContext.beginPath();
                    activeContext.rect(left, top, offset.getX(), offset.getY());
                    activeContext.stroke();
                    activeContext.fill();

                    if (/mouseup|touchend/i.test(event)) {
                        activeCanvas.popPath();
                        activeCanvas.pushPath(new ArtCanvas.Rectangle(left, top, offset.getX(), offset.getY()));
                    }

                    break;
                case ArtCanvas.Figure.CIRCLE :
                    var centerX = point.getX();
                    var centerY = point.getY();
                    var radius  = ArtCanvas.Point.getDistance(point, new ArtCanvas.Point(x, y));

                    activeContext.beginPath();
                    activeContext.arc(centerX, centerY, radius, 0, (2 * Math.PI), false);
                    activeContext.stroke();
                    activeContext.fill();

                    if (/mouseup|touchend/i.test(event)) {
                        activeCanvas.popPath();
                        activeCanvas.pushPath(new ArtCanvas.Circle(centerX, centerY, radius, 0, (2 * Math.PI), false));
                    }

                    break;
                case ArtCanvas.Figure.LINE :
                    activeContext.beginPath();
                    activeContext.moveTo(point.getX(), point.getY());
                    activeContext.lineTo(x, y);
                    activeContext.stroke();

                    if (/mouseup|touchend/i.test(event)) {
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
                case ArtCanvas.Transform.TRANSLATE :
                    amounts.push(offset.getX());
                    amounts.push(offset.getY());
                    break;
                case ArtCanvas.Transform.SCALE :
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
                case ArtCanvas.Transform.ROTATE :
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

        this.container.addEventListener(ArtCanvas.MouseEvents.START, function(event) {
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
                case ArtCanvas.Mode.HAND   :
                case ArtCanvas.Mode.ERASER :
                    activeContext.beginPath();
                    activeContext.moveTo(x, y);
                    break;
                case ArtCanvas.Mode.FIGURE :
                    _figure(activeCanvas, activeContext, x, y, event.type);
                    break;
                case ArtCanvas.Mode.TEXT :
                    activeCanvas.createTextbox(new ArtCanvas.Point(x, y));
                    return;
                case ArtCanvas.Mode.TRANSFORM :
                    break;
                default :
                    break;
            }

            activeCanvas.pushPath([new ArtCanvas.Point(x, y)]);

            isDown = true;

            self.callbacks.drawstart(activeCanvas, activeContext, x, y);
        }, true);

        this.container.addEventListener(ArtCanvas.MouseEvents.MOVE, function(event) {
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
                case ArtCanvas.Mode.HAND   :
                case ArtCanvas.Mode.ERASER :
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
                case ArtCanvas.Mode.TEXT :
                    break;
                case ArtCanvas.Mode.FIGURE :
                    _figure(activeCanvas, activeContext, x, y, event.type);
                    break;
                case ArtCanvas.Mode.TRANSFORM :
                    _transform(activeCanvas, x, y);
                    break;
                default :
                    break;
            }

            self.callbacks.drawmove(activeCanvas, activeContext, x, y);
        }, true);

        global.addEventListener(ArtCanvas.MouseEvents.END, function(event) {
            if (!isDown) {
                return;
            }

            var activeCanvas  = self.layers[self.activeLayer];
            var activeContext = activeCanvas.getContext();

            var x = activeCanvas.getOffsetX(event);
            var y = activeCanvas.getOffsetY(event);

            switch (self.mode) {
                case ArtCanvas.Mode.HAND :
                    break;
                case ArtCanvas.Mode.ERASER :
                    activeContext.globalCompositeOperation = 'source-over';
                    break;
                case ArtCanvas.Mode.FIGURE :
                    _figure(activeCanvas, activeContext, x, y, event.type);
                    imagedata = null;
                    break;
                case ArtCanvas.Mode.TEXT :
                    break;
                case ArtCanvas.Mode.TRANSFORM :
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
     * This method is getter for container width for drawing
     * @return {number} This is returned as container width for drawing
     */
    ArtCanvas.prototype.getContainerWidth = function() {
        return parseInt(this.container.style.width);
    };

    /**
     * This method is getter for container height for drawing
     * @return {number} This is returned as container height for drawing
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
            case ArtCanvas.Mode.HAND      :
            case ArtCanvas.Mode.FIGURE    :
            case ArtCanvas.Mode.ERASER    :
            case ArtCanvas.Mode.TRANSFORM :
            case ArtCanvas.Mode.TOOL      :
                this.mode = m;
                break;
            case ArtCanvas.Mode.TEXT      :
                this.mode = m;
                this.addLayer(this.getContainerWidth(), this.getContainerHeight());
                break;
            default :
                break;
        }

        var canvas = this.layers[this.activeLayer];
        canvas.drawText(this.textStyle);;

        this.callbacks.changemode(m);

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
            this.callbacks.selectlayer(n);
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

            this.callbacks.showlayer(canvas, n);
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

            this.callbacks.hidelayer(canvas, n);
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
        this.layers.push(new ArtCanvas.Canvas(this.container, null, width, height, (this.layers.length + 2)));
        this.activeLayer = this.layers.length - 1;

        this.callbacks.addlayer(this.layers[this.activeLayer], this.activeLayer);

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

            this.callbacks.removelayer(canvas, n);
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
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setFillStyle = function(fillStyle) {
        var canvas = this.layers[this.activeLayer];
        canvas.setFillStyle(fillStyle);

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
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setStrokeStyle = function(strokeStyle) {
        var canvas = this.layers[this.activeLayer];
        canvas.setStrokeStyle(strokeStyle);

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
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setLineWidth = function(lineWidth) {
        var canvas = this.layers[this.activeLayer];
        canvas.setLineWidth(lineWidth);

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
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setLineCap = function(lineCap) {
        var canvas = this.layers[this.activeLayer];
        canvas.setLineCap(lineCap);

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
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setLineJoin = function(lineJoin) {
        var canvas = this.layers[this.activeLayer];
        canvas.setLineJoin(lineJoin);

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
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setShadowColor = function(shadowColor) {
        var canvas = this.layers[this.activeLayer];
        canvas.setShadowColor(shadowColor);

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
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setShadowBlur = function(shadowBlur) {
        var canvas = this.layers[this.activeLayer];
        canvas.setShadowBlur(shadowBlur);

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
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setShadowOffsetX = function(offsetX) {
        var canvas = this.layers[this.activeLayer];
        canvas.setShadowOffsetX(offsetX);

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
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setShadowOffsetY = function(offsetY) {
        var canvas = this.layers[this.activeLayer];
        canvas.setShadowOffsetY(offsetY);

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
     * @return {ArtCanvas} This is returned for method chain.
     */
    ArtCanvas.prototype.setGlobalAlpha = function(alpha) {
        var canvas = this.layers[this.activeLayer];
        canvas.setGlobalAlpha(alpha);

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

        var images       = [];
        var layerPointer = 0;
        var self         = this;

        var draw = function() {
            for (var i = 0, len = images.length; i < len; i++) {
                exportedContext.drawImage(images[i], 0, 0);
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

            if (canvasElement.style.visibility === 'hidden') {
                layerPointer++;
                loadImage();
                return;
            }

            var src   = canvasElement.toDataURL('image/png');
            var image = new Image();

            image.src = src;

            image.onload = function() {
                images.push(image);

                layerPointer++;
                loadImage();
            };
        };

        loadImage();

        return this;
    };

    (function() {

        /**
         * This interface defines some methods for drawing.
         */
        function Drawable() {
        }

        /**
         * This method draws something object.
         * @param {CanvasRenderingContext2D} context This argumnet is the instance of CanvasRenderingContext2D.
         */
        Drawable.prototype.draw = function(context) {
        };

        /**
         * This method calculates offset coordinate between the 2 points and creates the instance of Point.
         * @param {CanvasRenderingContext2D} context This argumnet is the instance of CanvasRenderingContext2D.
         * @return {Point} This is returned as the instance of Point.
         */
        Drawable.prototype.getCenterPoint = function(context) {
        };

        ArtCanvas.Drawable = Drawable;

    })();

    (function() {

        /**
         * This static class wraps event for drawing.
         */
        function MouseEvents() {
        };

        var click = '';
        var start = '';
        var move  = '';
        var end   = '';

        // Touch Panel ?
        if (/iPhone|iPad|iPod|Android/.test(navigator.userAgent)) {
            click = 'touchend';
            start = 'touchstart';
            move  = 'touchmove';
            end   = 'touchend';
        } else {
            click = 'click';
            start = 'mousedown';
            move  = 'mousemove';
            end   = 'mouseup';
        }

        MouseEvents.CLICK = click;
        MouseEvents.START = start;
        MouseEvents.MOVE  = move;
        MouseEvents.END   = end;

        ArtCanvas.MouseEvents = MouseEvents;

    })();

    (function() {

        /**
         * This static class defines strings for representing application status.
         */
        function Mode() {
        }

        Mode.HAND      = 'hand';
        Mode.FIGURE    = 'figure';
        Mode.TEXT      = 'text';
        Mode.ERASER    = 'eraser';
        Mode.TOOL      = 'tool';
        Mode.TRANSFORM = 'transform';

        ArtCanvas.Mode = Mode;

    })();

    (function() {

        /**
         * This static class defines strings for drawing figure.
         */
        function Figure() {
        }

        Figure.RECTANGLE = 'rectangle';
        Figure.CIRCLE    = 'circle';
        Figure.LINE      = 'line';

        ArtCanvas.Figure = Figure;

    })();

    (function() {

        /**
         * This static class defines strings for transforms.
         */
        function Transform() {
        }

        Transform.TRANSLATE = 'translate';
        Transform.SCALE     = 'scale';
        Transform.ROTATE    = 'rotate';

        ArtCanvas.Transform = Transform;

    })();

    (function() {

        /**
         * This static class defines strings for draw tools.
         */
        function Tool() {
        }

        Tool.DROPPER = 'dropper';
        Tool.BUCKET  = 'bucket';

        ArtCanvas.Tool = Tool;

    })();

    (function() {

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
            var a = parseInt(alpha);

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
            var rgba = 'rgba(' + this.red
                     + ', '    + this.green
                     + ', '    + this.blue
                     + ', '    + this.alpha
                     + ')';
 
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

        ArtCanvas.Color = Color;

    })();

    (function() {

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

        ArtCanvas.Point = Point;

    })();

    (function() {

        /**
         * This class is to represent rectangle.
         * @param {number} top This argument is vertical coordinate at upper-left.
         * @param {number} left This argument is horizontal coordinate at upper left.
         * @param {number} width This argument is rectangle width.
         * @param {number} height This argument is rectangle height.
         * @constructor
         * @implements {Drawable}
         */
        function Rectangle(top, left, width, height) {
            // Call interface constructor
            ArtCanvas.Drawable.call(this);

            this.top    = 0;
            this.left   = 0;
            this.width  = 0;
            this.height = 0;

            var t = parseFloat(top);
            var l = parseFloat(left);
            var w = parseFloat(width);
            var h = parseFloat(height);

            if (!isNaN(t)) {this.top    = t;}
            if (!isNaN(l)) {this.left   = l;}
            if (w >= 0)    {this.width  = w;}
            if (h >= 0)    {this.height = h;}
        }

        /** @implements {Drawable} */
        Rectangle.prototype = Object.create(ArtCanvas.Drawable.prototype);
        Rectangle.prototype.constructor = Rectangle;

        /**
         * This method is getter for vertical coordinate at upper-left.
         * @return {number} This is returned as vertical coordinate at upper-left.
         */
        Rectangle.prototype.getTop = function() {
            return this.top;
        };

        /**
         * This method is getter for horizontal coordinate at upper-left.
         * @return {number} This is returned as horizontal coordinate at upper-left.
         */
        Rectangle.prototype.getLeft = function() {
            return this.left;
        };

        /**
         * This method is getter for vertical coordinate at lower-right.
         * @return {number} This is returned as vertical coordinate at lower-right.
         */
        Rectangle.prototype.getBottom = function() {
            return this.top + this.height;
        };

        /**
         * This method is getter for horizontal coordinate at lower-right.
         * @return {number} This is returned as horizontal coordinate at lower-right.
         */
        Rectangle.prototype.getRight = function() {
            return this.left + this.width;
        };

        /**
         * This method is getter for coordinate at upper-left.
         * @return {Obect.<string, number>} This is returned as associative array for coordinate at upper-left.
         */
        Rectangle.prototype.getLeftTop = function() {
            return {top : this.top, left : this.left};
        };

        /**
         * This method is getter for coordinate at lower-right.
         * @return {Obect.<string, number>} This is returned as associative array for coordinate at lower-right.
         */
        Rectangle.prototype.getRightBottom = function() {
            return {bottom : (this.top + this.height), right : (this.left + this.width)};
        };

        /**
         * This method is getter for rectangle width.
         * @return {number} This is returned as rectangle width.
         */
        Rectangle.prototype.getWidth = function() {
            return this.width;
        };

        /**
         * This method is getter for rectangle height.
         * @return {number} This is returned as rectangle height.
         */
        Rectangle.prototype.getHeight = function() {
            return this.height;
        };

        /**
         * This method is getter for rectangle size.
         * @return {Object.<string, number>} This is returned as associative array for rectangle size.
         */
        Rectangle.prototype.getSize = function() {
            return {width : this.width, height : this.height};
        };

        /** @override */
        Rectangle.prototype.draw = function(context) {
            context.beginPath();
            context.rect(this.top, this.left, this.width, this.height);
            context.stroke();
            context.fill();
        };

        /** @override */
        Rectangle.prototype.getCenterPoint = function(context) {
            var centerX = parseInt(this.width  / 2) + this.left;
            var centerY = parseInt(this.height / 2) + this.top;

            return new ArtCanvas.Point(centerX, centerY);
        };

        ArtCanvas.Rectangle = Rectangle;

    })();

    (function() {

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
            ArtCanvas.Drawable.call(this);

            this.centerX = 0;
            this.centerY = 0;
            this.radius  = 0;

            var cx = parseFloat(centerX);
            var cy = parseFloat(centerY);
            var r  = parseFloat(radius);

            if (!isNaN(cx)) {this.centerX = cx;}
            if (!isNaN(cy)) {this.centerY = cy;}
            if (r >= 0)     {this.radius  = r;}
        }

        /** @implements {Drawable} */
        Circle.prototype = Object.create(ArtCanvas.Drawable.prototype);
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
            return new ArtCanvas.Point(this.centerX, this.centerY);
        };

        ArtCanvas.Circle = Circle;

    })();

    (function() {

        /**
         * This class is to represent line.
         * @param {Point} startPoint This argument is the instance of Point for start point.
         * @param {Point} endPoint This argument is the instance of Point for end point.
         * @constructor
         * @implements {Drawable}
         */
        function Line(startPoint, endPoint) {
            // Call interface constructor
            ArtCanvas.Drawable.call(this);

            this.startPoint = null;
            this.endPoint   = null;

            if (startPoint instanceof ArtCanvas.Point) {
                this.startPoint = startPoint;
            }

            if (endPoint instanceof ArtCanvas.Point) {
                this.endPoint = endPoint;
            }
        };

        /** @implements {Drawable} */
        Line.prototype = Object.create(ArtCanvas.Drawable.prototype);
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
            var minX = Math.min(this.startPoint.x, this.endPoint.x);
            var minY = Math.min(this.startPoint.y, this.endPoint.y);
            var maxX = Math.max(this.startPoint.x, this.endPoint.x);
            var maxY = Math.max(this.startPoint.y, this.endPoint.y);

            var centerX = parseInt(((maxX - minX) / 2) + minX);
            var centerY = parseInt(((maxY - minY) / 2) + minY);

            return new ArtCanvas.Point(centerX, centerY);
        };

        ArtCanvas.Line = Line;

    })();

    (function() {

        /**
         * This class has properties that are to draw text on canvas.
         * @param {string} text This argument is text that is drawn on canvas.
         * @param {Point} point This argument is the instance of Point for text position.
         * @param {TextStyle} textStyle This argument is the instance of TextStyle.
         * @constructor
         * @implements {Drawable}
         */
        function Text(text, point, textStyle) {
            // Call interface constructor
            ArtCanvas.Drawable.call(this);

            this.text      = String(text);
            this.point     = new ArtCanvas.Point(0, 0);
            this.textStyle = null;

            if (point instanceof ArtCanvas.Point) {
                this.point = point;
            }

            if (textStyle instanceof TextStyle) {
                this.textStyle = textStyle;
            }
        }

        /** @implements {Drawable} */
        Text.prototype = Object.create(ArtCanvas.Drawable.prototype);
        Text.prototype.constructor = Text;

        /**
         * This method is getter for text that is drawn on canvas.
         * @return {string} This is returned as text that is drawn on canvas.
         */
        Text.prototype.getText = function() {
            return this.text;
        };

        /**
         * This method is getter for the instance of Point.
         * @return {Point} This is returned as the instance of Point.
         */
        Text.prototype.getPoint = function() {
            return this.point;
        };

        /**
         * This method is getter for the instance of TextStyle.
         * @return {TextStyle} This is returned as the instance of TextStyle.
         */
        Text.prototype.getTextStyle = function() {
            return this.textStyle;
        };

        /** @override */
        Text.prototype.draw = function(context) {
            var font  = this.textStyle.getFont();
            var color = this.textStyle.getColor();

            var heldColor = context.fillStyle;

            context.font = font.getFontString();
            context.fillStyle = color;
            context.fillText(this.text, this.point.getX(), this.point.getY());

            context.fillStyle = heldColor;
        };

        /** @override */
        Text.prototype.getCenterPoint = function(context) {
            var font      = this.textStyle.getFont();
            var fontSize  = parseInt(font.getSize());

            var centerX = this.point.getX() + parseInt(context.measureText(this.text).width / 2);
            var centerY = this.point.getY() + parseInt(fontSize / 2);

            return new ArtCanvas.Point(centerX, centerY);
        };

        /**
         * This class is to represent text style.
         * @param {Font} font This argument is the instance of Font.
         * @param {string} color This argument is string for color.
         * @constructor
         */
        function TextStyle(font, color) {
            this.font  = null;
            this.color = String(color);

            if (font instanceof Font) {
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
         * This method is getter for string for color.
         * @return {string} This is returned as string for color.
         */
        TextStyle.prototype.getColor = function() {
            return this.color;
        };

        /**
         * This class has properties that relate to font.
         * @param {string} family This argument is string like CSS font-family.
         * @param {string} style This argument is string like CSS font-style.
         * @param {string} size This argument is string like CSS font-size.
         * @constructor
         */
        function Font(family, style, size) {
            this.family = String(family);
            this.style  = String(style);
            this.size   = String(size);
        }

        /**
         * This method is getter for font-family.
         * @return {string} This is returned as string for font-family.
         */
        Font.prototype.getFamily = function() {
            return this.family;
        };

        /**
         * This method is getter for font-style.
         * @return {string} This is returned as string for font-style.
         */
        Font.prototype.getStyle = function() {
            return this.style;
        };

        /**
         * This method is getter for font-size.
         * @return {string} This is returned as string for font-size.
         */
        Font.prototype.getSize = function() {
            return this.size;
        };

        /**
         * TThis method joins string for font.
         * @return {string} This is returned as joins string for font.
         */
        Font.prototype.getFontString = function() {
            return this.style + ' ' + this.size + ' ' + '"' + this.family + '"';
        };

        ArtCanvas.Text      = Text;
        ArtCanvas.TextStyle = TextStyle;
        ArtCanvas.Font      = Font;

    })();

    (function() {

        /**
         * This class extends Image class.
         * @param {string} src This argument is image file path.
         * @param {function} onloadCallback This argument is invoked when image was loaded.
         * @constructor
         * @extends {Image}
         * @implements {Drawable}
         */
        function DrawableImage(src, onloadCallback) {
            // Call interface constructor
            ArtCanvas.Drawable.call(this);

            this.image     = new Image();
            this.image.src = src;

            this.image.onload = onloadCallback;
        }

        /** @extends {Image} */
        DrawableImage.prototype = Object.create(Image.prototype);

        /** @implements {Drawable} */
        DrawableImage.prototype = Object.create(ArtCanvas.Drawable.prototype);

        DrawableImage.prototype.constructor = DrawableImage;

        /** @override */
        DrawableImage.prototype.draw = function(context) {
            context.drawImage(this.image, 0, 0);
        };

        /** @override */
        DrawableImage.prototype.getCenterPoint = function(context) {
            var centerX = Math.floor(this.image.width  / 2);
            var centerY = Math.floor(this.image.height / 2);

            return new ArtCanvas.Point(centerX, centerY);
        };

        ArtCanvas.DrawableImage = DrawableImage;

    })();

    (function() {

        /**
         * This class is defined for the feature of eraser.
         * @param {Point} point This argumnet is the instance of Point
         */
        function Eraser(point) {
            this.point = null;

            if (point instanceof ArtCanvas.Point) {
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
            if (this.point instanceof ArtCanvas.Point) {
                return this.point.getX();
            } else {
                return 0;
            }
        };

        /**
         * This method is getter for vertical coordinate.
         * @return {number} This is returned as vertical coordinate.
         */
        Eraser.prototype.getY = function() {
            if (this.point instanceof ArtCanvas.Point) {
                return this.point.getY();
            } else {
                return 0;
            }
        };

        ArtCanvas.Eraser = Eraser;

    })();

    (function() {

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
             for (var i = 0., len = input.data.length; i < len; i++) {
                switch (i % 4) {
                    case 0 :
                        // Operate red color
                        output.data[i] = Math.floor(1.5 * input.data[i]);

                        if (output.data[i] > 255) {
                            output.data[i] = 255;
                        }

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
                var x = Math.floor(Math.random() * width);
                var y = Math.floor(Math.random() * height);

                var p = ((y * width) + x) * 4;

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

            var NUM_INDEX = 9;

            var indexs = new Array(NUM_INDEX);  // [(left-top), (top), (right-top), (left), (center), (right), (left-bottom), (bottom), (right-bottom)]
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

                for (var j = 0; j < NUM_INDEX; j++) {
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
            var input  = canvas.context.getImageData(0, 0, canvas.canvas.width, canvas.canvas.height);
            var output = canvas.context.createImageData(canvas.canvas.width, canvas.canvas.height);

            canvas.context.putImageData(this[this.type](input, output), 0, 0);

            return this;
        };

        ArtCanvas.Filter = Filter;

    })();

    (function() {

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

            if (w > 0) {this.canvas.width  = w;}
            if (h > 0) {this.canvas.height = h;}

            this.clear();

            this.canvas.style.position = 'absolute';
            this.canvas.style.top      = '0px';
            this.canvas.style.left     = '0px';
            this.canvas.style.zIndex   = zIndex;

            this.context.strokeStyle = new ArtCanvas.Color(0, 0, 0, 1.0).toString();
            this.context.fillStyle   = new ArtCanvas.Color(0, 0, 0, 1.0).toString();
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
         * @return {HTMLCanvasElement} This is returned as the instance of HTMLCanvasElement
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

                        if (path instanceof ArtCanvas.Eraser) {
                            this.context.globalCompositeOperation = 'destination-out';
                        }

                        if (j === 0) {
                            this.context.beginPath();
                            this.context.moveTo(x, y);
                        } else {
                            this.context.lineTo(x, y);
                            this.context.stroke();
                        }

                        if (path instanceof ArtCanvas.Eraser) {
                            this.context.globalCompositeOperation = 'source-over';
                        }
                    }
                } else if (paths instanceof ArtCanvas.Filter) {
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
            if (!(textStyle instanceof ArtCanvas.TextStyle)) {
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

            this.paths.push(new ArtCanvas.Text(text, new ArtCanvas.Point(x, y), textStyle));
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

            var image = new ArtCanvas.DrawableImage(String(src), function() {
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
                case ArtCanvas.Transform.TRANSLATE :
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
                case ArtCanvas.Transform.SCALE :
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
                case ArtCanvas.Transform.ROTATE :
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
                case ArtCanvas.Transform.TRANSLATE :
                case ArtCanvas.Transform.SCALE     :
                    this.context.setTransform(1, 0, 0, 1, 0, 0);
                    this.context.transform(1, 0, 0, 1, centerX, centerY);
                    this.context.transform.apply(this.context, rotateMatrix);
                    this.context.transform(1, 0, 0, 1, -centerX, -centerY);

                    this.context.transform(scales.x, 0, 0, scales.y, translates.x, translates.y);

                    break;
                case ArtCanvas.Transform.ROTATE :
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
            this.paths = [];
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
         * This method gets fill color.
         * @return {string} This is returned as fill color.
         */
        Canvas.prototype.getFillStyle = function() {
            return this.context.fillStyle;
        };

        /**
         * This method sets fill color..
         * @param {string} fillStyle This argument is string for color.
         * @return {Canvas} This is returned for method chain.
         */
        Canvas.prototype.setFillStyle = function(fillStyle) {
            this.context.fillStyle = String(fillStyle);
            this.draw(true);

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
         * This method sets stroke color..
         * @param {string} strokeStyle This argument is string for color.
         * @return {Canvas} This is returned for method chain.
         */
        Canvas.prototype.setStrokeStyle = function(strokeStyle) {
            this.context.strokeStyle = String(strokeStyle);
            this.draw(true);

            return this;
        };

        /**
         * This method gets line width
         * @return {number} This is returned as line width.
         */
        Canvas.prototype.getLineWidth = function() {
            return this.context.lineWidth;
        };

        /**
         * This method sets line width.
         * @param {number} lineWidth This argument is line width.
         * @return {Canvas} This is returned for method chain.
         */
        Canvas.prototype.setLineWidth = function(lineWidth) {
            var w = parseFloat(lineWidth);

            if (w > 0) {
                this.context.lineWidth= w;
                this.draw(true);
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
         * @return {Canvas} This is returned for method chain.
         */
        Canvas.prototype.setLineCap = function(lineCap) {
            if (!/butt|round|square/i.test(String(lineCap))) {
                return this;
            }

            this.context.lineCap = lineCap.toLowerCase();
            this.draw(true);

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
         * @return {Canvas} This is returned for method chain.
         */
        Canvas.prototype.setLineJoin = function(lineJoin) {
            if (!/bevel|round|miter/i.test(String(lineJoin))) {
                return this;
            }

            this.context.lineJoin = lineJoin.toLowerCase();
            this.draw(true);

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
         * @return {Canvas} This is returned for method chain.
         */
        Canvas.prototype.setShadowColor = function(shadowColor) {
            this.context.shadowColor = String(shadowColor);
            this.draw(true);

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
         * @return {Canvas} This is returned for method chain.
         */
        Canvas.prototype.setShadowBlur = function(shadowBlur) {
            var b = parseFloat(shadowBlur);

            if (b >= 0) {
                this.context.shadowBlur = b;
                this.draw(true);
            }

            return this;
        };

        /**
         * This method gets alpha.
         * @return {number} This is returned as alpha.
         */
        Canvas.prototype.getGlobalAlpha = function() {
            return this.context.globalAlpha;
        };

        /**
         * This method sets alpha.
         * @param {number} alpha This argument is between 0 and 1.
         * @return {Canvas} This is returned for method chain.
         */
        Canvas.prototype.setGlobalAlpha = function(alpha) {
            var a = parseFloat(alpha);

            if ((a >= 0) && (a <= 1)) {
                this.context.globalAlpha = a;
                this.draw(true);
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
         * @return {Canvas} This is returned for method chain.
         */
        Canvas.prototype.setShadowOffsetX = function(offsetX) {
            var x = parseFloat(offsetX);

            if (!isNaN(x)) {
                this.context.shadowOffsetX = x;
                this.draw(true);
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
         * @return {Canvas} This is returned for method chain.
         */
        Canvas.prototype.setShadowOffsetY = function(offsetY) {
            var y = parseFloat(offsetY);

            if (!isNaN(y)) {
                this.context.shadowOffsetY = y;
                this.draw(true);
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

                    var centerX = parseInt(((maxX - minX) / 2) + minX);
                    var centerY = parseInt(((maxY - minY) / 2) + minY);

                    point = new ArtCanvas.Point(centerX, centerY);
                } else if (paths instanceof ArtCanvas.Drawable) {
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
            if (!(point instanceof ArtCanvas.Point)) {
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
                return new ArtCanvas.Color(0, 0, 0, 1.0);
            }

            var picks = this.context.getImageData(this.getOffsetX(event), this.getOffsetY(event), 1, 1);
            var color = new ArtCanvas.Color(picks.data[0], picks.data[1], picks.data[2], (picks.data[3] / 255));

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

            if (!(color instanceof ArtCanvas.Color)) {
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

            var baseColor = new ArtCanvas.Color(
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
            var filter = new ArtCanvas.Filter(type, amounts);

            filter.filter(this);

            this.paths.push(filter);
            this.increaseHistoryPointer();

            return this;
        };

        ArtCanvas.Canvas = Canvas;

    })();

    // Export
    global.ArtCanvas = ArtCanvas;

})(window);
