ArtCanvas.js
=========
  
HTML5 Canvas Library
  
## Overview
  
This library enables to create image authoring application like Photoshop.  
In concrete, this library may be useful to implement the following features.
  
* Layer
* Draw (Pen, Figure, Text ..etc)
* Styles (Color, Line Width, Text Styles ...etc)
* Transforms (Translate, Scale, Rotate)
* Tools for drawing
  
## Demo
  
* [Art Canvas](http://korilakkuma.github.io/ArtCanvas/)
  
## Usage
  
The 1st, ArtCanvas class is required.
  
    <script type="text/javascript" src="ArtCanvas.js"></script>
  
Next, the instance of ArtCanvas must be created.  
ArtCanvas constructor requires 4 arguments.  
  
1. HTMLElement (that is parent node of HTMLCanvasElement)
1. HTMLCanvasElement
1. Canvas Width
1. Canvas Height
  
for example,
  
    var canvas    = document.querySelector('canvas');
    var container = canvas.parentNode;
    var width     = 600;  // px
    var height    = 600;  // px
  
    // Create the instance of ArtCanvas
    var artCanvas = new ArtCanvas(container, canvas, width, height);
  
## API
  
### Mode
  
This library has the following modes.
  
    console.log(ArtCanvas.Mode.HAND);       // This mode is in order to draw by pen
    console.log(ArtCanvas.Mode.FIGURE);     // This mode is in order to draw figures
    console.log(ArtCanvas.Mode.TEXT);       // This mode is in order to draw text
    console.log(ArtCanvas.Mode.TRANSFORM);  // This mode is in order to transform drawn objects
    console.log(ArtCanvas.Mode.TOOL);       // This mode is in order to tools for drawing
  
Getter and Setter for these mode are the following,
  
    // Getter
    var mode = artCanvas.getMode();  // -> ArtCanvas.Mode.HAND is the default mode
    
    // Setter
    artCanvas.setMode(ArtCanvas.Mode.FIGURE);  // -> change mode to ArtCanvas.Mode.FIGURE
  
### Layer
  
#### Select
  
    var layerNumber = 0;  // This value is number between 0 and (the number of layers - 1)

    artCanvas.selectLayer(layerNumber);
  
#### Add
  
    artCanvas.addLayer();
  
#### Remove
  
    var layerNumber = 0;  // This value is number between 0 and (the number of layers - 1)

    artCanvas.removeLayer(layerNumber);
  
#### Show / Hide
  
    var layerNumber = 0;  // This value is number between 0 and (the number of layers - 1)

    artCanvas.showLayer(layerNumber);
    artCanvas.hideLayer(layerNumber);
  
#### Alpha (Opacity)
  
    var alpha = 0.5;  // This value is number between 0 and 1

    artCanvas.setGlobalAlpha(alpha);
  
### Draw
  
#### Pen
  
In the case of drawing by pen,
  
    // Change mode
    artCanvas.setMode(ArtCanvas.Mode.HAND);
  
The line is drawn by drag on canvas.
  
#### Figures
  
In the case of drawing figures,
  
    // Change mode
    artCanvas.setMode(ArtCanvas.Mode.FIGURE);

    // Select figure
    artCanvas.setFigure(ArtCanvas.Figure.RECTANGLE);  // Draw Rectangle
    artCanvas.setFigure(ArtCanvas.Figure.CIRCLE);     // Draw Circle
    artCanvas.setFigure(ArtCanvas.Figure.LINE);       // Draw Line
  
The selected figure is drawn by drag on canvas.
  
#### Text
  
In the case of drawing text,
  
    // Change mode
    artCanvas.setMode(ArtCanvas.Mode.TEXT);
  
Textbox is created by click on canvas.  
If text input ended, the text is drawn on canvas by changing to other mode.
  
    // Change mode -> The typed text is drawn
    artCanvas.setMode(ArtCanvas.Mode.HAND);
  
#### Image
  
In the case of drawing image,
  
    var src = /* image file path */;

    artCanvas.drawImage(src);
  
#### Eraser
  
In the case of using eraser,
  
    artCanvas.setMode(ArtCanvas.Mode.ERASER);
  
### Styles
  
#### fill style / stroke style
  
It is required that color string (hex, rgb, hsl, rgba, hsla ...etc) is designated for fill style and stroke style.
  
    artCanvas.setFillStyle('rgba(0, 0, 255, 1.0)');    // fill style
    artCanvas.setStrokeStyle('rgba(255, 0, 0, 1.0)');  // stroke style
  
#### line width
  
    var lineWidth = 3;  // This value is greater than 0

    artCanvas.setLineWidth(lineWidth);
  
#### line cap
  
    var lineCap = 'round';  // one of 'butt', 'round', 'square'

    artCanvas.setLineCap(lineCap);
  
#### line join
  
    var lineJoin = 'round';  // one of 'bevel', 'round', 'miter'

    artCanvas.setLineJoin(lineCap);
  
#### Text style
  
    var fontFamily = 'Helvetica';
    var fontStyle  = 'oblique';
    var fontSize   = '24px'

    // Create the instance of ArtCanvas.Font
    var font = new ArtCanvas.Font(fontFamily, fontStyle, fontSize);

    // color string (hex, rgb, hsl, rgba, hsla ...etc)
    var color = 'rgba(153, 153, 153, 1.0)';

    // Set the instance of ArtCanvas.TextStyle
    artCanvas.setTextStyle(new ArtCanvas.TextStyle(font, color));
  
#### Shadow Effect
  
    var shadowColor   = 'rgba(0, 0, 0, 0.2)';  // Color string (hex, rgb, hsl, rgba, hsla ...etc)
    var shadowBlur    = 3;                     // This value is greater than or equal to 0.
    var shadowOffsetX = -3;
    var shadowOffsetY = -3;

    artCanvas.setShadowColor(shadowColor);
    artCanvas.setShadowBlur(shadowBlur);
    artCanvas.setShadowOffsetX(shadowOffsetX);
    artCanvas.setShadowOffsetY(shadowOffsetY);
  
### Transforms
  
The first, it is required to change the application mode.
  
    artCanvas.setMode(ArtCanvas.Mode.TRANSFORM);
  
Next, it is required to designate transform type.
  
    artCanvas.setTransform(ArtCanvas.Transform.TRANSLATE);  // Translate
    artCanvas.setTransform(ArtCanvas.Transform.SCALE);      // Scale
    artCanvas.setTransform(ArtCanvas.Transform.ROTATE);     // Rotate
  
### Tools
  
#### Dropper
  
    // Get the instance of ArtCanvas.Color
    var color = artCanvas.pickColor(event);  // The 1st argument is event object
    var rgba  = color.toString();            // rgba(...)
    var hex   = color.toHexString();         // #...
  
#### Bucket
  
    artCanvas.fill(event, 'rgba(255, 0, 0, 1.0)');  // The 1st argument is event object
  
### Image Filters
  
#### Red-Emphasis
  
    artCanvas.filter(ArtCanvas.Filter.REDEMPHASIS);
  
#### Grayscale
  
    artCanvas.filter(ArtCanvas.Filter.GRAYSCALE);
  
#### Reverse
  
    artCanvas.filter(ArtCanvas.Filter.REVERSE);
  
#### Noise
  
    var width   = artCanvas.getContainerWidth();
    var height  = artCanvas.getContainerHeight();
    var noise   = 30000
    var amounts = [width, height, noise];

    artCanvas.filter(ArtCanvas.Filter.NOISE, amounts);
  
#### Blur
  
    var width   = artCanvas.getContainerWidth();
    var amounts = [width];

    artCanvas.filter(ArtCanvas.Filter.BLUR, amounts);
  
### Export
  
    var format   = 'png';  // one of 'gif', 'jpg', 'png'
    var callback = function(image) {
        // The 1st argument is Data URL of exported image
    };

    artCanvas.export(format, callback);
  
