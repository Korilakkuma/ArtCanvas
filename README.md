ArtCanvas
=========

HTML 5 Canvas Library

# Overview
  
This module is library for drawing by HTML5 Canvas.  
This library has some methods for drawing illust, figure and text easily.  
In addition, the functions that general drawing applications have, for example,  
managing history, useful tools and image filters, are also given to you by this library.  
  
## Sample code
  
#### Setup
  
    var artCanvas = ArtCanvas('canvas');  //Get closure
    artCanvas.draw('mousedown', mousemove', 'mouseup');     //for PC
    artCanvas.draw('touchstart', 'touchmove', 'touchend');  //for Smartphone, Tablet
  
The argument of "ArtCanvas" is id attribute for canvas tag.  
This setup enables application to draw on canvas.  
  
#### Change mode
  
The argument of "setMode" method is string type either "illust" or "figure" or "text" or "tool".
  
    //Change "Figure mode"
    artCanvas.setMode('figure');         //Change mode
    artCanvas.setFigure('stroke-rect');  //Select figure type
  
The argument of "setFigure" method is string type  
either "stroke-rect" or "fill-rect" or "stroke-circle" or "fill-circle"  
or "path" or "linear-gradient-top" or "linear-gradient-bottom" or "bezier2".  
  
    //Change "Text mode"
    artCanvas.setMode('text');                        //Change mode
    artCanvas.setText('Text for drawing on canvas');  //Set text content
  
The argument of "setText" method is string type for drawing on canvas.  
  
    //Change "Tool mode"
    artCanvas.setMode('tool');     //Change mode
    artCanvas.setTool('dropper');  //Select tool type
  
The argument of "setTool" method is string type  
either "dropper" or "translate" or "zoom-in" or "zoom-out" or "rotate".  
  
    //Change "Eraser mode"
    artCanvas.erase(function(){/*Callback on eraser OFF*/}, function(){/*Callback on eraser ON*/});
  
#### Parameters
  
Accessing to canvas context enables parameters to be changed.
  
    //Color
    artCanvas.context.strokeStyle = 'rgba(255, 0, 0, 1)';  //Set color(stroke)
    artCanvas.context.fillStyle   = 'rgba(255, 0, 0, 1)';  //Set color(fill)
  
    //Font
    artCanvas.context.font = '24px "Arial"';  //Set font-size and font-family
  
#### Others
  
    //Undo
    artCanvas.undo(function(){window.alert('Cannot undo !!');});
  
    //Redo
    artCanvas.redo(function(){window.alert('Cannot redo !!');});
  
    //Clear
    artCanvas.clear(function(){return window.confirm('Erase canvas data ?');});
  
    //Draw image data to canvas
    artCanvas.loadImage(event, function(){/*Callback on success*/});  //event is object of file form event
  
    //Image filter
    artCanvas.runFilter('red');
  
The argument of "runFilter" is string type either "red" or "gray" or "reverse" or "blur" or "transform".  
  
#### bootstrap.js
  
This file is sample code by using "ArtCanvas.js".  
  
## Demo
  
The application that uses this library is in the following URL .  
  
[http://curtaincall.myhome.cx/portfolio-instant-canvas-presentation/](http://curtaincall.myhome.cx/portfolio-instant-canvas-presentation/ "Instant Canvas Presentation")  
  
