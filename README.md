ArtCanvas.js
=========
  
HTML5 Canvas Library
  
## Overview
  
This library enables to create image authoring application like Photoshop.  
In concrete, this library may be useful to implement the following features.
  
* Draw (Pen, Figure, Text ..etc)
* Styles (Color, Line Width, Text Styles ...etc)
* Transforms (Translate, Scale, Rotate)
* Layer
  
## Demo
  
[Art Canvas](http://korilakkuma.github.io/ArtCanvas/)
  
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
  
### Draw
  
### Styles
  
### Transforms
  
### Layer
  
