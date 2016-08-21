(function(global) {
    'use strict';

    // Mocks

    function ArtCanvas(container, canvas, width, height, callbacks) {
    }

    /** Constant values as class properties (static properties) */
    ArtCanvas.DEFAULT_SIZES        = {};
    ArtCanvas.DEFAULT_SIZES.WIDTH  = 300;
    ArtCanvas.DEFAULT_SIZES.HEIGHT = 300;

    function Drawable() {
    }

    function MouseEvents() {
    }

    MouseEvents.CLICK = 'click';
    MouseEvents.START = 'mousedown';
    MouseEvents.MOVE  = 'mousemove';
    MouseEvents.END   = 'mouseup';

    function Mode() {
    }

    Mode.HAND      = 'hand';
    Mode.FIGURE    = 'figure';
    Mode.TEXT      = 'text';
    Mode.ERASER    = 'eraser';
    Mode.TOOL      = 'tool';
    Mode.TRANSFORM = 'transform';

    function Figure() {
    }

    Figure.RECTANGLE = 'rectangle';
    Figure.CIRCLE    = 'circle';
    Figure.LINE      = 'line';

    function Transform() {
    }

    Transform.TRANSLATE = 'translate';
    Transform.SCALE     = 'scale';
    Transform.ROTATE    = 'rotate';

    function Tool() {
    }

    Tool.DROPPER = 'dropper';
    Tool.BUCKET  = 'bucket';

    function Color(red, green, blue, alpha) {
    }

    function Point(pointX, pointY) {
        this.x = pointX;
        this.y = pointY;
    }

    Point.prototype.getX = function() {
        return this.x;
    };

    Point.prototype.getY = function() {
        return this.y;
    };

    function Rectangle(top, left, width, height) {
    }

    function Circle(centerX, centerY, radius) {
    }

    function Line(startPoint, endPoint) {
    }

    function Text(text, point, textStyle) {
    }

    function TextStyle(font, color) {
        this.font  = font;
        this.color = color;
    }

    TextStyle.prototype.getFont = function() {
        return this.font;
    };

    function Font(family, style, size) {
        this.family = family;
        this.style  = style;
        this.size   = size;
    }

    Font.prototype.getSize = function() {
        return this.size;
    };

    function DrawableImage(src, onloadCallback) {
    }

    function Eraser(point) {
    }

    function Filter(type, amounts) {
    }

    function Canvas(container, canvas, width, height, zIndex) {
        this.container = container;
        this.canvas    = document.createElement('canvas');

        this.container.appendChild(this.canvas);
    }

    Canvas.prototype.getCanvas = function() {
        return this.canvas;
    };

    Canvas.prototype.drawText = function() {
    };

    ArtCanvas.Drawable      = Drawable;
    ArtCanvas.MouseEvents   = MouseEvents;
    ArtCanvas.Mode          = Mode;
    ArtCanvas.Figure        = Figure;
    ArtCanvas.Transform     = Transform;
    ArtCanvas.Tool          = Tool;
    ArtCanvas.Color         = Color;
    ArtCanvas.Point         = Point;
    ArtCanvas.Rectangle     = Rectangle;
    ArtCanvas.Circle        = Circle;
    ArtCanvas.Line          = Line;
    ArtCanvas.Text          = Text;
    ArtCanvas.TextStyle     = TextStyle;
    ArtCanvas.Font          = Font;
    ArtCanvas.DrawableImage = DrawableImage;
    ArtCanvas.Eraser        = Eraser;
    ArtCanvas.Filter        = Filter;
    ArtCanvas.Canvas        = Canvas;

    // Export
    global.Mocks           = {};
    global.Mocks.ArtCanvas = ArtCanvas;

})(window);
