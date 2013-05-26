/*
 *
 * ArtCanvas.js
 *
 * This module is library for drawing by HTML5 Canvas.
 * This library has some methods for drawing illust, figure and text easily.
 * In addition, the functions that general drawing applications have, for example,
 * managing history, useful tools and image filters, are also given to you by this library.
 *
 * MIT License
 *
 * Copyright 2012@Tomohiro IKEDA
 *
 */
 
 
 
var ArtCanvas = function(canvasID, historySize, initCallback){
    var canvas  = document.getElementById(canvasID);
    var context = null;

    if(this.canvas !== null){
        context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    }else {
        throw new Error('ArtCanvas constructor : The 1st argument is id for canvas node !!');
    }

    var figureType = 'stroke-rect';  //for drawing figure
    var text       = '';             //for drawing text
    var toolType   = 'dropper';      //for Tool mode

    //for mousemove event
    var isMouse = false;
    //for manage application mode
    var flags   = {illust : true, figure : false, text : false, tool : false, eraser : false};
    //Starting points (The origin is left-top in canvas)
    var points  = {x1 : 0, y1 : 0, x2 : 0, y2 : 0};
    //Color object (for gradient and droppper)
    var rgbs    = {r : 0, g : 0, b : 0};

    if(typeof initCallback === 'function'){
        initCallback(context);
    }else {
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
    var STACK_SIZE = (size > 0) ? size : 100;

    //Get instances of private class as closure
    var history = History(STACK_SIZE);
    var filter  = Filter();

    //Private methods
    var getPoint = function(where){
        return points[where];
    };

    var setPoint = function(where, value){
        points[where] = value;
    };

    var isPoints = function(dimension){
        switch(dimension){
            case 1 : return (points.x1 && points.y1);
            case 2 : return (points.x1 && points.y1 && points.x2 && points.y2);
        }
    };

    var clearPoints = function(){
        points.x1 = points.y1 = points.x2 = points.y2 = 0;
    };

    var getX = function(event){
        if(event.pageX){
            //Desktop
        }else if(event.touches[0]){
            event = event.touches[0];         //Smartphone
        }else if(event.changedTouches[0]){
            event = event.changedTouches[0];  //Smartphone
        }

        return event.pageX - canvas.offsetLeft;
    };

    var getY = function(event){
        if(event.pageY){
            //Desktop
        }else if(event.touches[0]){
            event = event.touches[0];         //Smartphone
        }else if(event.changedTouches[0]){
            event = event.changedTouches[0];  //Smartphone
        }

        return event.pageY - canvas.offsetTop;
    };

    var drawIllust = function(x, y){
        if(!flags.illust)return;

        context.beginPath();
        context.moveTo(points.x1, points.y1);  //Starting points
        context.lineTo(x, y);                  //Ending points
        context.stroke();                      //Draw illust
        points.x1 = x;
        points.y1 = y;
    };

    var drawFigure = function(x, y){
        if(!flags.figure)return;

        //Get figure width, height, and start points
        var width  = Math.abs(x - points.x1);
        var height = Math.abs(y - points.y1);
        var minX   = Math.min(x, points.x1);
        var minY   = Math.min(y, points.y1);
        var maxX   = Math.max(x, points.x1);
        var maxY   = Math.max(y, points.y1);

        //Draw figure
        switch(figureType){
            case 'stroke-rect' :
                context.strokeRect(minX, minY, width, height);
                break;
            case 'fill-rect' :
                context.fillRect(minX, minY, width, height);
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
            case 'linear-gradient-top' :
                var gradient = context.createLinearGradient(minX, minY, minX, maxY);
                gradient.addColorStop(0.0, 'rgba(' +  rgbs.r +', ' + rgbs.g + ', ' + rgbs.b + ', ' + '0.0)');
                gradient.addColorStop(0.5, 'rgba(' +  rgbs.r +', ' + rgbs.g + ', ' + rgbs.b + ', ' + '0.5)');
                gradient.addColorStop(1.0, 'rgba(' +  rgbs.r +', ' + rgbs.g + ', ' + rgbs.b + ', ' + '1.0)');
                context.fillStyle = gradient;
                context.fillRect(minX, minY, width, height);
                break;
            case 'linear-gradient-bottom' :
                var gradient = context.createLinearGradient(minX, minY, minX, maxY);
                gradient.addColorStop(1.0, 'rgba(' +  rgbs.r +', ' + rgbs.g + ', ' +  rgbs.b + ', ' + '0.0)');
                gradient.addColorStop(0.5, 'rgba(' +  rgbs.r +', ' + rgbs.g + ', ' +  rgbs.b + ', ' + '0.5)');
                gradient.addColorStop(0.0, 'rgba(' +  rgbs.r +', ' + rgbs.g + ', ' +  rgbs.b + ', ' + '1.0)');
                context.fillStyle = gradient;
                context.fillRect(minX, minY, width, height);
                break;
            case 'bezier2' :
                if(isPoints(2)){
                    //The 1st mousedown -> Get starting points
                    //The 2nd mousedown -> Get control points
                    //Drag -> Draw bezier
                    context.beginPath();
                    context.moveTo(points.x1, points.y1)
                    context.quadraticCurveTo(x, y, points.x2, points.y2);
                    context.stroke();
                }
                break;
        }
    };

    var drawText = function(x, y){
        if(!flags.text)return;

        var width  = Math.abs(x - points.x1);
        var height = Math.abs(y - points.y1);
        var textX  = Math.min(x, points.x1);
        var textY  = Math.min(y, points.y1);

        //The size of 1 character
        var charWidth  = context.measureText(text).width / text.length;
        var charHeight = Number(context.font.replace(/(\d+)px.*/, '$1'));

        //The number of character on 1 line. (at least 1 character)
        var numChar = Math.floor(width / charWidth);
        numChar = numChar < 1 ? 1 : numChar;

        //Draw text
        for(var i = 0; i < text.length; i += numChar){
            var line = text.slice(i, (i + numChar));
            textY += charHeight;
            context.fillText(line, textX, textY);
        }
    };

    return {
        canvas     : canvas,
        context    : context,
        draw       : function(start, move, end){
            var start = (start === 'touchstart') ? start : 'mousedown';
            var move  = (move  === 'touchmove' ) ? move  : 'mousemove';
            var end   = (end   === 'touchend'  ) ? end   : 'mouseup'  ;

            var holdImage = '';  //for translate
            var self = this;

            canvas.addEventListener(start, function(event){
                if(flags.tool && (toolType !== 'translate'))return;

                var getImage = context.getImageData(0, 0, canvas.width, canvas.height);  //for history
                var x = getX(event);
                var y = getY(event);

                if(flags.illust || flags.figure || flags.text){
                    //Draw
                    //Beizer or otherwise ?
                    if(flags.figure && (figureType === 'bezier2')){
                        //Bezier
                        if(isPoints(1)){
                            //The 2nd operation
                            history.pushHistory(1, getImage);
                            isMouse   = true;
                            points.x2 = x;
                            points.y2 = y;
                        }else {
                            //The 1st operation
                            //Not store history in the 1st operation
                            points.x1 = x;
                            points.y1 = y;
                        }
                    }else {
                        //Illust mode or Figure mode or Text mode
                        history.pushHistory(1, getImage);
                        isMouse   = true;
                        points.x1 = x;
                        points.y1 = y;
                    }
                }else {
                    //Translate tool
                    history.pushHistory(1, getImage);
                    isMouse   = true;
                    points.x1 = x;
                    points.y1 = y;
                    holdImage = self.getDataURL('png');
                }
            }, true);

            canvas.addEventListener(move, function(event){
                if(!isMouse || (flags.tool && (toolType !== 'translate')))return;

                var x = getX(event);
                var y = getY(event);

                if(flags.illust || flags.figure || flags.text){
                    //Determine flags
                    if(flags.illust){
                        //Illust mode
                        drawIllust(x, y);
                    }else if(flags.figure){
                        //Figure mode
                        //Clear previous draw
                        context.putImageData(history.popHistory(0), 0, 0);

                        if(figureType === 'bezier2'){
                            if(isPoints(2))drawFigure(x, y);  //Bezier
                        }else {
                            drawFigure(x, y);  //Otherwise
                        }
                    }else if(flags.text){
                        //Text mode
                        context.putImageData(history.popHistory(0), 0, 0);  //Clear previous draw
                        drawText(x, y);
                    }
                }else {
                    //Translate tool
                    var translateX = x - points.x1;
                    var translateY = y - points.y1;

                    var image = new Image();
                    image.src = holdImage;

                    image.onload = function(){
                        context.save();
                        context.clearRect(0, 0, canvas.width, canvas.height);
                        context.translate(translateX, translateY);
                        context.drawImage(this, 0, 0);
                        context.restore();
                    };
                }
            }, true);

            window.addEventListener(end, function(){
                if(flags.tool && (toolType !== 'translate'))return;

                isMouse = false;  //Mouse OFF

                //Clear points (except beizer)
                if(flags.figure && (figureType === 'bezier2')){
                    if(isPoints(2))clearPoints();
                }else {
                    clearPoints();
                }
            }, true);
        },
        loadImage  : function(event, successCallback){
            var MAX_UPLOAD_SIZE = 5 * Math.pow(10, 6);  //Max upload size (5 MB)

            var file   = (event.type === 'drop') ? event.dataTransfer.files[0] : event.target.files[0];  //File object
            var reader = null;  //FileReader object
            var self   = this;

            //Get FileReader object
            reader = new FileReader();

            //FileReader event handler on error
            reader.onerror = function(){
                throw new Error('ArtCanvas loadImage() : FileReader Error !! Error code is ' + reader.error.code);
            };

            if((file.type.indexOf('image') !== -1) && (file.size <= MAX_UPLOAD_SIZE)){
                //Read file as dataURL
                reader.readAsDataURL(file);

                //FileReader event handler on success
                reader.onload = function(){
                    var image = new Image();
                    image.src = reader.result;

                    image.onload = function(){
                        history.pushHistory(1, context.getImageData(0, 0, canvas.width, canvas.height));
                        context.drawImage(this, 0, 0, canvas.width, canvas.height);

                        if(typeof successCallback === 'function')successCallback(file);
                    };
                };
            }else {
                if(file.type.indexOf('image') === -1){
                    //File is not image file
                    throw new Error('Please upload image file !!');
                }else if(file.size > MAX_UPLOAD_SIZE){
                    //Exceeds max upload size
                    throw new Error('File size exceeds ' + (MAX_UPLOAD_SIZE / Math.pow(10, 6)) + ' MB !!');
                }else {
                    //Cannot get File object
                    //throw new Error('Please upload file !!');
                }
            }
        },
        getDataURL : function(format){
            var format = (typeof format === 'string') ? format.toLowerCase() : 'png';

            //Get dataURL
            return canvas.toDataURL('image/' + format).replace('image/' + format, 'image/octet-stream');
        },
        getMode    : function(){
            for(var key in flags){
                if(flags[key])return key;
            }
        },
        setMode    : function(mode){
            var mode = mode.toLowerCase();

            //Clear
            for(var key in flags)flags[key] = false;
            clearPoints();
            context.globalCompositeOperation = 'source-over';  //Eraser OFF

            if(mode in flags){
                flags[mode] = true;
            }else {
                throw new Error('ArtCanvas setMode() : The argument is string type either "illust" or "figure" or "text" or "tool" or "eraser" !!'); 
            }
        },
        getFigure  : function(){
            return figureType;
        },
        setFigure  : function(type){
            switch(type.toLowerCase()){
                case 'stroke-rect'            :
                case 'fill-rect'              :
                case 'stroke-circle'          :
                case 'fill-circle'            :
                case 'path'                   :
                case 'linear-gradient-top'    :
                case 'linear-gradient-bottom' :
                case 'bezier2' :
                    figureType = type;
                    break;
                default :
                    throw new Error('ArtCanvas setFigure() : The argument is string type either "stroke-rect" or "fill-rect" or "stroke-circle" or "fill-circle" or "path" or "linear-gradient-top" or "linear-gradient-bottom" or "bezier2" !!');
            }
        },
        getText    : function(){
            return text;
        },
        setText    : function(str){
            text = String(str);
        },
        getTool    : function(){
            return toolType;
        },
        setTool    : function(type){
            switch(type.toLowerCase()){
                case 'dropper'   :
                case 'translate' :
                case 'zoom-in'   :
                case 'zoom-out'  :
                case 'rotate'    :
                    toolType = type;
                    break;
                default :
                    throw new Error('ArtCanvas setTool() : The argument is string type either "dropper" or "translate" or "zoom-in" or "zoom-out" or "rotate" !!');
            }
        },
        getRGB     : function(color){
            switch(color.toLowerCase()){
                case 'r' :
                case 'g' :
                case 'b' :
                    return rgbs[color];
                default :
                    throw new Error('ArtCanvas getRGB() : The argument is string type either "r" or "g" or "b" !!')
            }
        },
        setRGB     : function(color, value){
            switch(color.toLowerCase()){
                case 'r' :
                case 'g' :
                case 'b' :
                    var value = parseInt(value);

                    if((value >= 0) && (value <= 255)){
                        rgbs[color] = value;
                    }else {
                        throw new Error('ArtCanvas setRGB() : The 2nd argument is number type between 0 and 255 !!')
                    }

                    break;
                default :
                    throw new Error('ArtCanvas setRGB() : The 1st argument is string type either "r" or "g" or "b" !!')
            }
        },
        undo       : function(errorCallback){
            if(history.getStackPointer() > 0){
                if(history.getStackPointer() === history.getCurrentMax())history.pushHistory(0, context.getImageData(0, 0, canvas.width, canvas.height));

                context.putImageData(history.popHistory(-1), 0, 0);
                clearPoints();
            }else {
                if(typeof errorCallback === 'function')errorCallback();
            }
        },
        redo       : function(errorCallback){
            if(history.getStackPointer() < history.getCurrentMax()){
                context.putImageData(history.popHistory(1), 0, 0);
                clearPoints();
            }else {
                if(typeof errorCallback === 'function')errorCallback();
            }
        },
        erase      : function(offCallback, onCallback){
            if(flags.tool)return;

            clearPoints();

            if(flags.eraser){
                flags.eraser = false;
                context.globalCompositeOperation = 'source-over';

                if(typeof offCallback === 'function')offCallback();
            }else {
                flags.eraser = true;
                context.globalCompositeOperation = 'destination-out';

                if(typeof onCallback  === 'function')onCallback();
            }
        },
        clear      : function(confirmCallback){
            var confirmCallback = (typeof confirmCallback === 'function') ? confirmCallback : function(){return true;};

            history.pushHistory(1, context.getImageData(0, 0, canvas.width, canvas.height));

            if(confirmCallback()){
                context.clearRect(0, 0, canvas.width, canvas.height);
                clearPoints();
            }
        },
        pickRGB    : function(event){
            if(toolType !== 'dropper')return;

            var pickX = getX(event);
            var pickY = getY(event);

            var pick = context.getImageData(pickX, pickY, 1, 1);

            rgbs.r = pick.data[0];
            rgbs.g = pick.data[1];
            rgbs.b = pick.data[2];
        },
        scale      : function(x, y){
            if(!flags.tool || ((toolType !== 'zoom-in') && (toolType !== 'zoom-out')))return;

            history.pushHistory(1, context.getImageData(0, 0, canvas.width, canvas.height));

            var scaleX = parseFloat(x);
            var scaleY = parseFloat(y);

            if((scaleX <= 0) || (scaleY <= 0))throw new Error('ArtCanvas scale() : The arguments are number type greater than 0 !!');

            var image = new Image();
            image.src = this.getDataURL('png');

            image.onload = function(){
                context.save();
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.scale(scaleX, scaleY);
                context.drawImage(this, 0, 0);
                context.restore();
            };
        },
        rotate        : function(angle){
           if(!flags.tool || (toolType !== 'rotate'))return;

            history.pushHistory(1, context.getImageData(0, 0, canvas.width, canvas.height));

            var angle   = parseFloat(angle);
            var centerX = canvas.width  / 2;
            var centerY = canvas.height / 2;

            if((angle < 0) || (angle > 360))throw new Error('ArtCanvas rotate() : The argument is number type between 0 and 360 !!');

            radian = (angle * Math.PI) / 180;

            var image = new Image();
            image.src = this.getDataURL('png');

            image.onload = function(){
                context.save();
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.translate(centerX, centerY);    //Move origin to center in canvas
                context.rotate(radian);
                context.translate(-centerX, -centerY);  //Move origin to left-top in canvas
                context.drawImage(this, 0, 0);
                context.restore();
            };
        },
        runFilter     : function(type){
            var createdata  = null;
            var getImage    = context.getImageData(0, 0, canvas.width, canvas.height);
            var createImage = context.createImageData(canvas.width, canvas.height);

            history.pushHistory(1, getImage);

            switch(type.toLowerCase()){
                case 'red' :
                    createdata = filter.redemphasis(getImage, createImage);
                    break;
                case 'gray' :
                    createdata = filter.grayscale(getImage, createImage);
                    break;
                case 'reverse' :
                    createdata = filter.reverse(getImage, createImage);
                    break;
                case 'blur' :
                    createdata = filter.blur(getImage, createImage, canvas.width);
                    break;
                case 'transform' :
                    createdata = filter.transform(getImage, createImage, canvas.width);
                    break;
                default :
                    throw new Error('ArtCanvas runFilter() : The argument is string type either "red" or "gray" or "reverse" or "blur" or "transform" !!');
            }

            context.putImageData(createdata, 0, 0);
        }
    };
};
 
 
 
/*
 *
 * History class
 *
 * This module is private class in ArtCanvas.
 * This module manages history of operation in canvas application.
 *
 */
 
 
 
var History = function(maxSize){
    var STACK_SIZE   = maxSize;  //Stack size
    var historyStack = [];       //Array for stack
    var sp           = 0;        //Stack pointer
    var currentMax   = 0;        //Current max stack pointer

    return {
        getStackPointer : function(){
            return sp;
        },
        getCurrentMax   : function(){
            return currentMax;
        },
        pushHistory     : function(increment, data){
            //Stack is filled ?
            if(sp > STACK_SIZE){
                throw new Error('ArtCanvas History pushHistory() : Stack is filled !!');
            }else if(sp === STACK_SIZE){
                //Clear stack
                historyStack.length = 0;
                sp                  = 0;
                currentMax          = 0;
            }

            historyStack[sp] = data;

            //Push canvas data
            if((increment === 0) || (increment === 1)){
                sp += increment;
                currentMax = sp;
            }else {
                throw new Error('ArtCanvas History pushHistory() : The 1st argument is number type either 0 or 1 !!');
            }
        },
        popHistory      : function(increment){
            //Stack empty ?
            if((increment === -1) && (sp === 0)){
                throw new Error('ArtCanvas History popHistory() : Stack is empty !!');
            }else {
                if((increment === -1) || (increment === 1)){
                    sp += increment;
                    return historyStack[sp];      //for undo, redo
                }else if(increment === 0){
                    return historyStack[sp - 1];  //for drawing
                }else {
                    throw new Error('ArtCanvas History popHistory() : The argument is number type either -1 or 0 or 1 !!');
                }
            }
        }
    };
};
 
 
 
/*
 *
 * Filter class
 *
 * This module is private class in ArtCanvas.
 * This module makes some effects to canvas image.
 *
 */
 
 
 
var Filter = function(){
    return {
        redemphasis : function(input, output){
            for(var i = 0., len = input.data.length; i < len; i++){
                switch(i % 4){
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
                }
            }

            return output;
        },
        grayscale   : function(input, output){
            for(var i = 0, len = input.data.length; i < len; i += 4){
                var mean = Math.floor((input.data[i] + input.data[i + 1] + input.data[i + 2]) / 3);
                output.data[i] = output.data[i + 1] = output.data[i + 2] = mean;
                output.data[i + 3] = input.data[i + 3];  //Alpha
            }

            return output;
        },
        reverse     : function(input, output){
            for(var i = 0, len = input.data.length; i < len; i += 4){
                output.data[i    ] = 255 - input.data[i    ];  //R
                output.data[i + 1] = 255 - input.data[i + 1];  //G
                output.data[i + 2] = 255 - input.data[i + 2];  //B
                output.data[i + 3] =       input.data[i + 3];  //Alpha
            }

            return output;
        },
        blur        : function(input, output, width){
            var NUM_INDEX = 9;
            var MAX_BLUR  = 5;

            var indexs = new Array(NUM_INDEX);  //[(left-top), (top), (right-top), (left), (center), (right), (left-bottom), (bottom), (right-bottom)]
            var blr = 0;
            var sum = 0;
            var num = 0;

            while(blr < MAX_BLUR){
                for(var i = 0, len = input.data.length; i < len; i++){
                    indexs = [(i - 4 - 4 * width), (i - 4 * width), (i + 4 - 4 * width),
                              (i - 4),             (i),             (i + 4),
                              (i - 4 + 4 * width), (i + 4 * width), (i + 4 + 4 * width)];

                    //Clear previous value
                    sum = 0;
                    num = 0;

                    for(var j = 0; j < NUM_INDEX; j++){
                        if((indexs[j] >= 0) && (indexs[j] < input.data.length)){
                            sum += input.data[indexs[j]];
                            num++;
                        }
                    }

                    output.data[i] = Math.floor(sum / num);
                }

                for(var i = 0, len = input.data.length; i < len; i++)input.data[i] = output.data[i];

                blr++;
            }

            return output;
        },
        transform   : function(input, output, width){
            var dx = 0
            var dy = 0;

            for(var i = 0, len = input.data.length; i < len; i++){
                dx = Math.floor((i % (4 * width)) / 4) + 1;
                dy = Math.floor(50 * Math.sin((dx * Math.PI) / 180));
                output.data[i] = input.data[i + (4 * width * dy)];
            }

            return output;
        }
    };
};
