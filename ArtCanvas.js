/** 
 * ArtCanvas.js
 * @fileoverview HTML5 Canvas Library for drawing
 *
 * Copyright 2012, 2013@Tomohiro IKEDA
 * Released under the MIT license
 */
 
 
 
var ArtCanvas = function(canvasID, containerID, historySize, initCallback){
    var canvas  = null;
    var context = null;

    if (Object.prototype.toString.call(canvasID) === '[object String]') {
        var canvas = document.getElementById(canvasID);

        if (canvas instanceof HTMLCanvasElement) {
            context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);  //Initialization
        } else {
            throw new Error('ArtCanvas : The designated canvas node ("' + canvasID + '") does not exists !!');
        }
    } else {
        throw new Error('ArtCanvas : The 1st argument is canvas node ID !!');
    }

    var container = null;

    if (Object.prototype.toString.call(containerID) === '[object String]') {
        container = document.getElementById(containerID);
    }

    var figureType = 'stroke-rect';  //for drawing figure
    var text       = '';             //for drawing text
    var toolType   = 'dropper';      //for Tool mode

    //for mousemove event
    var isMouse = false;

    //for manage application mode
    var flags = {
      illust : true,
      figure : false,
      text   : false,
      tool   : false,
      eraser : false
    };

    //Starting points (The origin is left-top in canvas)
    var points = {
      x1 : 0,
      y1 : 0,
      x2 : 0,
      y2 : 0
    };

    //Color object (for gradient and droppper)
    var rgbs = {
      r : 0,
      g : 0,
      b : 0
    };

    if (Object.prototype.toString(initCallback) === '[object Function]') {
        initCallback(context);
    } else {
        context.lineJoin    = 'miter';
        context.lineCap     = 'butt';
        context.lineWidth   = 1;
        context.globalAlpha = 1;
        context.shadowBlur  = 0;
        context.strokeStyle = 'rgba(0, 0, 0, 1.0)';
        context.fillStyle   = 'rgba(0, 0, 0, 1.0)';
        context.shadowColor = 'rgba(0, 0, 0, 1.0)';
        context.font        = '24px "Arial"';
    }

    var size = parseInt(historySize);

    if (size < 1) {
        size = 100;
    }

    //Private methods
    var _getPoint = function(where){
        return points[where];
    };

    var _setPoint = function(where, value){
        points[where] = value;
    };

    var _isPoints = function(dimension){
        switch (dimension) {
            case 1  : return (points.x1 && points.y1);
            case 2  : return (points.x1 && points.y1 && points.x2 && points.y2);
            default : return;
        }
    };

    var _clearPoints = function(){
        points.x1 = points.y1 = points.x2 = points.y2 = 0;
    };

    var _getX = function(event){
        if (event.pageX) {
            //Desktop
        } else if (event.touches[0]) {
            event = event.touches[0];         //Smartphone
        } else if (event.changedTouches[0]) {
            event = event.changedTouches[0];  //Smartphone
        }

        var scrollLeft = (container === null) ? 0 : container.scrollLeft;

        return event.pageX - canvas.offsetLeft + scrollLeft;
    };

    var _getY = function(event){
        if (event.pageY) {
            //Desktop
        } else if (event.touches[0]) {
            event = event.touches[0];         //Smartphone
        } else if (event.changedTouches[0]) {
            event = event.changedTouches[0];  //Smartphone
        }

        var scrollTop = (container === null) ? 0 : container.scrollTop;

        return event.pageY - canvas.offsetTop + scrollTop;
    };

    var _drawIllust = function(x, y){
        if (!flags.illust) {
            return;
        }

        context.beginPath();
        context.moveTo(points.x1, points.y1);  //Starting points
        context.lineTo(x, y);                  //Ending points
        context.stroke();                      //Draw illust
        points.x1 = x;
        points.y1 = y;
    };

    var _drawFigure = function(x, y){
        if (!flags.figure) {
            return;
        }

        //Get figure width, height, and start points
        var width  = Math.abs(x - points.x1);
        var height = Math.abs(y - points.y1);
        var minX   = Math.min(x, points.x1);
        var minY   = Math.min(y, points.y1);
        var maxX   = Math.max(x, points.x1);
        var maxY   = Math.max(y, points.y1);

        //Draw figure
        switch (figureType) {
            case 'rect' :
                context.beginPath();
                context.rect(minX, minY, width, height);
                context.stroke();
                context.fill();

                break;
            case 'stroke-rect' :
                context.beginPath();
                context.rect(minX, minY, width, height);
                context.stroke();

                break;
            case 'fill-rect' :
                context.beginPath();
                context.rect(minX, minY, width, height);
                context.fill();

                break;
            case 'circle' :
                context.beginPath();
                context.arc(points.x1, points.y1, Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)), 0, (2 * Math.PI), false);
                context.stroke();
                context.fill();

                //for masking unnecessary path
                context.beginPath();
                context.moveTo(points.x1, points.y1);
                context.lineTo(x, y);
                context.fill();

                break;
            case 'stroke-circle' :
                context.beginPath();
                context.arc(points.x1, points.y1, Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)), 0, (2 * Math.PI), false);
                context.stroke();

                break;
            case 'fill-circle' :
                context.beginPath();
                context.arc(points.x1, points.y1, Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)), 0, (2 * Math.PI), false);
                context.fill();

                break;
            case 'path' :
                context.beginPath();
                context.moveTo(points.x1, points.y1);
                context.lineTo(x, y);
                context.stroke();

                break;
            case 'bezier2' :
                if (_isPoints(2)) {
                    //The 1st mousedown -> Get starting points
                    //The 2nd mousedown -> Get control points
                    //Drag -> Draw bezier
                    context.beginPath();
                    context.moveTo(points.x1, points.y1);
                    context.quadraticCurveTo(x, y, points.x2, points.y2);
                    context.stroke();
                }

                break;
            default :
                break;
        }
    };

    var _drawText = function(x, y){
        if (!flags.text) {
            return;
        }

        var width  = Math.abs(x - points.x1);
        var height = Math.abs(y - points.y1);
        var textX  = Math.min(x, points.x1);
        var textY  = Math.min(y, points.y1);

        //The size of 1 character
        var charWidth  = context.measureText(text).width / text.length;
        var charHeight = parseInt(context.font.match(/\s*(\d+)px.*/)[1]);

        //The number of character on 1 line. (at least 1 character)
        var numChar = Math.floor(width / charWidth);
        numChar = numChar < 1 ? 1 : numChar;

        //Draw text
        for (var i = 0; i < text.length; i += numChar) {
            var line = text.slice(i, (i + numChar));
            textY += charHeight;
            context.fillText(line, textX, textY);
        }
    };

    /** 
     * This private class defines some properties for history
     * @param {number} maxSize This argument is in order to determine size of stack. The default value is 100
     */
    var History = function(size){
        var STACK_SIZE   = size + 1;  //Stack size
        var historyStack = [];        //Array for stack
        var sp           = 0;         //Stack pointer

        return {
            getStackPointer : function(){
                return sp;
            },
            getStackSize :function(){
                return historyStack.length;
            },
            getPrevImage : function(){
                return historyStack[sp - 1];
            },
            setCurrentImage : function(data){
                if (sp === STACK_SIZE) {
                    //Clear stack
                    historyStack.shift();
                    sp--;
                }

                historyStack[sp] = data;
            },
            pushHistory : function(data){
                //Stack is filled ?
                if (sp === STACK_SIZE) {
                    //Remove the oldest data
                    historyStack.shift();
                    sp--;
                }

                historyStack[sp++] = data;

                //for on the way of Undo or Redo
                if (historyStack.length > sp) {
                    historyStack.length = sp;
                }
            },
            undo : function(){
                //Stack empty ?
                if (sp === 0) {
                    console.error('ArtCanvas History undo() : Stack is empty !!');
                } else {
                    return historyStack[--sp];
                }
            },
            redo : function(){
                //Stack overflow ?
                if (sp === historyStack.length) {
                    console.error('ArtCanvas History redo() : Stack is overflow !!');
                } else {
                    return historyStack[++sp];
                }
            }
        };
    };

    /** 
     * This private class defines some properties for image filter
     */

    var Filter = function(){
        return {
            redemphasis : function(input, output){
                for (var i = 0., len = input.data.length; i < len; i++) {
                    switch (i % 4) {
                        case 0 :
                            //Operate red color
                            output.data[i] = Math.floor(1.5 * input.data[i]);
                            if(output.data[i] > 255)output.data[i] = 255;
                            break;
                        case 1 :
                            //Operate green color
                            output.data[i] = Math.floor(0 * input.data[i]);
                            break;
                        case 2 :
                            //Operate blue color
                            output.data[i] = Math.floor(1 * input.data[i]);
                            break;
                        case 3 :
                            //Operate alpha channel
                            output.data[i] = Math.floor(1 * input.data[i]);
                            break;
                        default :
                            break;
                    }
                }

                return output;
            },
            grayscale : function(input, output){
                for (var i = 0, len = input.data.length; i < len; i += 4) {
                    var mean = Math.floor((input.data[i] + input.data[i + 1] + input.data[i + 2]) / 3);
                    output.data[i] = output.data[i + 1] = output.data[i + 2] = mean;
                    output.data[i + 3] = input.data[i + 3];  //Alpha
                }

                return output;
            },
            reverse : function(input, output){
                for (var i = 0, len = input.data.length; i < len; i += 4) {
                    output.data[i + 0] = 255 - input.data[i + 0];  //R
                    output.data[i + 1] = 255 - input.data[i + 1];  //G
                    output.data[i + 2] = 255 - input.data[i + 2];  //B
                    output.data[i + 3] =       input.data[i + 3];  //Alpha
                }

                return output;
            },
            noise : function(input, output, width, height, noise){
                var n = parseInt(noise);

                if (isNaN(n) || (n < 0)) {
                    n = 30000;
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
            },
            blur : function(input, output, width){
                var NUM_INDEX = 9;

                var indexs = new Array(NUM_INDEX);  //[(left-top), (top), (right-top), (left), (center), (right), (left-bottom), (bottom), (right-bottom)]
                var sum = 0;
                var num = 0;

                for (var i = 0, len = input.data.length; i < len; i++) {
                    indexs = [(i - 4 - 4 * width), (i - 4 * width), (i + 4 - 4 * width),
                              (i - 4),             (i),             (i + 4),
                              (i - 4 + 4 * width), (i + 4 * width), (i + 4 + 4 * width)];

                    //Clear previous value
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
            },
            transform : function(input, output, width){
                var dx = 0;
                var dy = 0;

                for (var i = 0, len = input.data.length; i < len; i++) {
                    dx = Math.floor((i % (4 * width)) / 4) + 1;
                    dy = Math.floor(50 * Math.sin((dx * Math.PI) / 180));
                    output.data[i] = input.data[i + (4 * width * dy)];
                }

                return output;
            }
        };
    };

    //Get instances of private class as closure
    var history = History(size);
    var filter  = Filter();

    return {
        canvas : canvas,
        context : context,
        draw : function(){

            var click = '';
            var start = '';
            var move  = '';
            var end   = '';

            //Touch Panel ?
            if (/iPhone|iPad|iPod|Android/.test(navigator.userAgent)) {
                click = 'tap';
                start = 'touchstart';
                move  = 'touchmove';
                end   = 'touchend';
            } else {
                click = 'click';
                start = 'mousedown';
                move  = 'mousemove';
                end   = 'mouseup';
            }

            var holdImage = '';  //for translate
            var self = this;

            canvas.addEventListener(start, function(event){
                if (flags.tool && (toolType !== 'translate')) {
                    return;
                }

                var getImage = context.getImageData(0, 0, canvas.width, canvas.height);  //for history
                var x = _getX(event);
                var y = _getY(event);

                if (flags.illust || flags.figure || flags.text) {
                    //Draw
                    //Beizer or otherwise ?
                    if (flags.figure && (figureType === 'bezier2')) {
                        //Bezier
                        if (_isPoints(1)) {
                            //The 2nd operation
                            history.pushHistory(getImage);
                            isMouse   = true;
                            points.x2 = x;
                            points.y2 = y;
                        } else {
                            //The 1st operation
                            //Not store history in the 1st operation
                            points.x1 = x;
                            points.y1 = y;
                        }
                    } else {
                        //Illust mode or Figure mode or Text mode
                        history.pushHistory(getImage);
                        isMouse   = true;
                        points.x1 = x;
                        points.y1 = y;
                    }
                } else {
                    //Translate tool
                    history.pushHistory(getImage);
                    isMouse   = true;
                    points.x1 = x;
                    points.y1 = y;

                    holdImage = canvas.toDataURL('image/png');
                }
            }, true);

            canvas.addEventListener(move, function(event){
                if (!isMouse || (flags.tool && (toolType !== 'translate'))) {
                    return;
                }

                event.preventDefault();  //for touch panel

                var x = _getX(event);
                var y = _getY(event);

                if (flags.illust || flags.figure || flags.text) {
                    //Determine flags
                    if (flags.illust) {
                        //Illust mode
                        _drawIllust(x, y);
                    } else if (flags.figure) {
                        //Figure mode
                        //Clear previous draw
                        context.putImageData(history.getPrevImage(), 0, 0);

                        if (figureType === 'bezier2') {
                            if (_isPoints(2)) {
                                _drawFigure(x, y);  //Bezier
                            }
                        } else {
                            _drawFigure(x, y);  //Otherwise
                        }
                    } else if (flags.text) {
                        //Text mode
                        context.putImageData(history.getPrevImage(), 0, 0);  //Clear previous draw
                        _drawText(x, y);
                    }
                } else {
                    //Translate tool
                    var translateX = x - points.x1;
                    var translateY = y - points.y1;

                    var image = new Image();
                    image.src = holdImage;

                    image.onload = function(){
                        context.save();
                        context.clearRect(0, 0, canvas.width, canvas.height);
                        context.translate(translateX, translateY);
                        context.globalAlpha = 1;
                        context.drawImage(this, 0, 0);
                        context.restore();
                    };
                }
            }, true);

            window.addEventListener(end, function(event){
                if (!isMouse) {
                    return;
                }

                if (flags.tool && (toolType !== 'translate')) {
                    return;
                }


                isMouse = false;  //Mouse OFF

                //Clear points (except beizer)
                if (flags.figure && (figureType === 'bezier2')) {
                    if (_isPoints(2)) {
                        _clearPoints();
                    }
                } else {
                    _clearPoints();
                }
            }, true);
        },
        getFileReaderError : function(reader){
            if (reader instanceof FileReader) {
                switch (reader.error.code) {
                    case reader.error.NOT_FOUND_ERR    : return 'NOT_FOUND_ERR';
                    case reader.error.SECURITY_ERR     : return 'SECURITY_ERR';
                    case reader.error.ABORT_ERR        : return 'ABORT_ERR';
                    case reader.error.NOT_READABLE_ERR : return 'NOT_READABLE_ERR';
                    case reader.error.ENCODING_ERR     : return 'ENCODING_ERR' ;
                    default : return 'ERR';
                }
            } else {
                console.error('ArtCanvas getFileReaderError() : The 1st argument is instance of FileReader !!');
            }
        },
        loadImage : function(event, successCallback, errorCallback){
            if (!(event instanceof Event)) {
                console.error('ArtCanvas loadImage() : The 1st argument is event object !!');
                return;
            }

            //for the instance of File (extends Blob)
            var file = null;

            if (event.type === 'drop') {
                event.preventDefault();

                file = /*('items' in event.dataTransfer) ? event.dataTransfer.items[0].getAsFile() : */event.dataTransfer.files[0];
            } else if ('files' in event.target) {
                file = event.target.files[0];
            } else {
                console.error('ArtCanvas loadImage() : The event object is "drop" or file form\'s "change" !!');
                return;
            }

            //Create the instance of FileReader
            var reader = new FileReader();

            var self = this;

            //FileReader event handler on error
            reader.onerror = function(){
                if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                    errorCallback(self.getFileReaderError(reader));
                }
            };

            if (!(file instanceof File)) {
                throw new Error('Please upload file !!');
            } else if (file.type.indexOf('image') === -1) {
                //File is not image file
                throw new Error('Please upload image file !!');
            } else {
                //Read file as dataURL
                reader.readAsDataURL(file);

                //FileReader event handler on success
                reader.onload = function(){
                    var image = new Image();
                    image.src = reader.result;

                    image.onload = function(){
                        history.pushHistory(context.getImageData(0, 0, canvas.width, canvas.height));
                        context.drawImage(this, 0, 0, canvas.width, canvas.height);

                        if (Object.prototype.toString.call(successCallback) === '[object Function]') {
                            successCallback(file);
                        }
                    };
                };
            }

            return file;
        },
        getDataURL : function(format){
            var format = (Object.prototype.toString.call(format) === '[object String]') ? format.toLowerCase() : 'png';

            //Get image file as Data URL
            return canvas.toDataURL('image/' + format).replace('image/' + format, 'image/octet-stream');
        },
        getMode : function(){
            for (var key in flags) {
                if (flags[key]) {
                    return key;
                }
            }
        },
        setMode : function(mode){
            var mode = String(mode).toLowerCase();

            //Clear
            for (var key in flags) {
                flags[key] = false;
            }

            _clearPoints();
            context.globalCompositeOperation = 'source-over';  //Eraser OFF

            if (mode in flags) {
                flags[mode] = true;
            } else {
                console.error('ArtCanvas setMode() : The 1st argument is one of "illust", "figure", "text", "tool", "eraser" !!'); 
            }
        },
        getFigure : function(){
            return figureType;
        },
        setFigure : function(type){
            switch (String(type).toLowerCase()) {
                case 'rect'          :
                case 'stroke-rect'   :
                case 'fill-rect'     :
                case 'circle'        :
                case 'stroke-circle' :
                case 'fill-circle'   :
                case 'path'          :
                case 'bezier2'       :
                    figureType = type;
                    break;
                default :
                    console.error('ArtCanvas setFigure() : The 1st argument is one of "rect", "stroke-rect", "fill-rect", "circle", "stroke-circle", "fill-circle", "path", "bezier2" !!');
                    break;
            }
        },
        getText : function(){
            return text;
        },
        setText : function(str){
            text = String(str);
        },
        getTool : function(){
            return toolType;
        },
        setTool : function(type){
            switch (String(type).toLowerCase()) {
                case 'dropper'   :
                case 'fill'      :
                case 'translate' :
                case 'zoom-in'   :
                case 'zoom-out'  :
                case 'rotate'    :
                    toolType = type;
                    break;
                default :
                    console.error('ArtCanvas setTool() : The 1st argument is one of "dropper", "fill", "translate", "zoom-in", "zoom-out", "rotate" !!');
                    break;
            }
        },
        getRGB : function(color){
            switch (String(color).toLowerCase()) {
                case 'r' :
                case 'g' :
                case 'b' :
                    return rgbs[color];
                default :
                    console.error('ArtCanvas getRGB() : The 1st argument is one of "r", "g", "b" !!');
                    break;
            }
        },
        setRGB : function(color, value){
            switch (String(color).toLowerCase()) {
                case 'r' :
                case 'g' :
                case 'b' :
                    var value = parseInt(value);

                    if ((value >= 0) && (value <= 255)) {
                        rgbs[color] = value;
                    } else {
                        console.error('ArtCanvas setRGB() : The 2nd argument is between 0 and 255 !!');
                    }

                    break;
                default :
                    console.error('ArtCanvas setRGB() : The 1st argument is one of "r", "g", "b" !!');
                    break;
            }
        },
        undo : function(errorCallback){
            if (history.getStackPointer() > 0) {
                if (history.getStackPointer() === history.getStackSize()) {
                    history.setCurrentImage(context.getImageData(0, 0, canvas.width, canvas.height));
                }

                context.putImageData(history.undo(), 0, 0);
                _clearPoints();
            } else {
                if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                    errorCallback();
                }
            }
        },
        redo : function(errorCallback){
            if (history.getStackPointer() < (history.getStackSize() - 1)) {
                context.putImageData(history.redo(), 0, 0);
                _clearPoints();
            } else {
                if (Object.prototype.toString.call(errorCallback) === '[object Function]') {
                    errorCallback();
                }
            }
        },
        erase : function(offCallback, onCallback){
            if (flags.tool) {
                return;
            }

            _clearPoints();

            if (flags.eraser) {
                flags.eraser = false;
                context.globalCompositeOperation = 'source-over';

                if (Object.prototype.toString.call(offCallback) === '[object Function]') {
                    offCallback();
                }
            } else {
                flags.eraser = true;
                context.globalCompositeOperation = 'destination-out';

                if (Object.prototype.toString.call(onCallback) === '[object Function]') {
                    onCallback();
                }
            }
        },
        clear : function(confirmCallback){
            confirmCallback = (Object.prototype.toString.call(confirmCallback) === '[object Function]') ? confirmCallback : function(){return true;};

            history.pushHistory(context.getImageData(0, 0, canvas.width, canvas.height));

            if (confirmCallback()) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                _clearPoints();
            }
        },
        pickRGB : function(event){
            if (toolType !== 'dropper') {
                return;
            }

            var pickX = _getX(event);
            var pickY = _getY(event);

            var picks = context.getImageData(pickX, pickY, 1, 1);

            rgbs.r = picks.data[0];
            rgbs.g = picks.data[1];
            rgbs.b = picks.data[2];
        },
        fill : function(event, rgbas){
            if (!(event instanceof Event)) {
                console.error('ArtCanvas fill() : The 1st argument is event object !!');
                return;
            }

            if (Object.prototype.toString.call(rgbas) !== '[object Object]') {
                console.error('ArtCanvas fill() : The 2nd argument is object that has four properties of "r" and "g" and "b" and "a" !!');
                return;
            }

            if (toolType !== 'fill') {
                return;
            }

            history.pushHistory(context.getImageData(0, 0, canvas.width, canvas.height));

            var imagedata = context.getImageData(0, 0, canvas.width, canvas.height);

            var startX = _getX(event);
            var startY = _getY(event);

            var getPixelPos = function(x, y){
                return ((canvas.width * y) + x) * 4;
            };

            var setPixelPos = function(pos){
                imagedata.data[pos    ] = rgbas.r;
                imagedata.data[pos + 1] = rgbas.g;
                imagedata.data[pos + 2] = rgbas.b;
                imagedata.data[pos + 3] = rgbas.a * 255;
            };

            var startPixelPos = getPixelPos(startX, startY);

            var baseColors = {
              r : imagedata.data[startPixelPos],
              g : imagedata.data[startPixelPos + 1],
              b : imagedata.data[startPixelPos + 2],
              a : imagedata.data[startPixelPos + 3]
            };

            var isMatchColor = function(x, y, colors){
                var pos = getPixelPos(x, y);

                if (imagedata.data[pos] !== colors.r) {
                    return false;
                } else if (imagedata.data[pos + 1] !== colors.g) {
                    return false;
                } else if (imagedata.data[pos + 2] !== colors.b) {
                    return false;
                } else if (imagedata.data[pos + 3] !== colors.a) {
                    return false;
                } else {
                    return true;
                }
            };

            var paintHorizon = function(left, right, y){
                for (var x = left; x <= right; x++) {
                    var pos = getPixelPos(x, y);
                    setPixelPos(pos);
                }
            };

            var scanHorizon = function(left, right, y, buffer){
                while (left <= right) {
                    while (left <= right) {
                        if (isMatchColor(left, y, baseColors)) {
                            break;
                        } else {
                            left++;
                        }
                    }

                    if (left > right) {
                        break;
                    }

                    while (left <= right) {
                        if (isMatchColor(left, y, baseColors)) {
                            left++;
                        } else {
                            break;
                        }
                    }

                    buffer.push({x : (left - 1), y : y});
                }
            };

            if (isMatchColor(startX, startY, rgbas)) {
                context.putImageData(imagedata, 0, 0);
                return;
            }

            var buffer = [];
            buffer.push({x : startX, y : startY});

            while (buffer.length > 0) {
                var positions = buffer.pop();

                var left  = positions.x;
                var right = positions.x;

                if (isMatchColor(positions.x, positions.y, rgbas)) {
                    continue;
                }

                //-> left
                while (0 < left) {
                    if (isMatchColor((left - 1), positions.y, baseColors)) {
                        left--;
                    } else {
                        break;
                    }
                }

                //-> right
                while (right < (canvas.width - 1)) {
                    if (isMatchColor((right + 1), positions.y, baseColors)) {
                        right++;
                    } else {
                        break;
                    }
                }

                paintHorizon(left, right, positions.y);

                if ((positions.y + 1) < canvas.height) {scanHorizon(left, right, (positions.y + 1), buffer);}
                if ((positions.y - 1) >= 0)            {scanHorizon(left, right, (positions.y - 1), buffer);}
            }

            context.putImageData(imagedata, 0, 0);
        },
        scale : function(x, y){
            if (!flags.tool || ((toolType !== 'zoom-in') && (toolType !== 'zoom-out'))) {
                return;
            }

            history.pushHistory(context.getImageData(0, 0, canvas.width, canvas.height));

            var scaleX = parseFloat(x);
            var scaleY = parseFloat(y);

            if ((scaleX <= 0) || (scaleY <= 0)) {
                console.error('ArtCanvas scale() : The arguments are greater than 0 !!');
                return;
            }

            var image = new Image();
            image.src = canvas.toDataURL('image/png');

            image.onload = function(){
                context.save();
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.scale(scaleX, scaleY);
                context.globalAlpha = 1;
                context.drawImage(this, 0, 0);
                context.restore();
            };
        },
        rotate : function(angle){
           if (!flags.tool || (toolType !== 'rotate')) {
               return;
           }

            history.pushHistory(context.getImageData(0, 0, canvas.width, canvas.height));

            var a = parseFloat(angle);
            var centerX = canvas.width / 2;
            var centerY = canvas.height / 2;

            if ((a < 0) || (a > 360)) {
                console.error('ArtCanvas rotate() : The 1st argument is between 0 and 360 !!');
                return;
            }

            var radian = (a * Math.PI) / 180;

            var image = new Image();
            image.src = canvas.toDataURL('image/png');

            image.onload = function(){
                context.save();
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.translate(centerX, centerY);    //Move origin to center in canvas
                context.rotate(radian);
                context.translate(-centerX, -centerY);  //Move origin to left-top in canvas
                context.globalAlpha = 1;
                context.drawImage(this, 0, 0);
                context.restore();
            };
        },
        filter : function(type, numNoise){
            var createdata  = null;
            var getImage    = context.getImageData(0, 0, canvas.width, canvas.height);
            var createImage = context.createImageData(canvas.width, canvas.height);

            history.pushHistory(getImage);

            switch (String(type).toLowerCase()) {
                case 'red' :
                    createdata = filter.redemphasis(getImage, createImage);
                    break;
                case 'gray' :
                    createdata = filter.grayscale(getImage, createImage);
                    break;
                case 'reverse' :
                    createdata = filter.reverse(getImage, createImage);
                    break;
                case 'noise' :
                    createdata = filter.noise(getImage, createImage, canvas.width, canvas.height, numNoise);
                    break;
                case 'blur' :
                    createdata = filter.blur(getImage, createImage, canvas.width);
                    break;
                case 'transform' :
                    createdata = filter.transform(getImage, createImage, canvas.width);
                    break;
                default :
                    console.error('ArtCanvas filter() : The 1st argument is one of "red", "gray", "reverse", "noise", "blur", "transform" !!');
                    break;
            }

            context.putImageData(createdata, 0, 0);
        }
    };
};
