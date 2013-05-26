/*
 *
 * bootstrap.js
 *
 * Copyright 2012@Tomohiro IKEDA
 *
 */
 
 
 
(function(){

    window.addEventListener('DOMContentLoaded', function(){

        //Update ApplicationCache?
        applicationCache.onupdateready = function(){
            if(window.confirm('You can use new version !! Update ?')){
                applicationCache.update();
                location.reload();
            }
        };

        //Constant value
        var SHOW_MODES       = {ILLUST : 'Illust', FIGURE : 'Figure', TEXT : 'Text', TOOL : 'Tool', ERASER : ' E'};
        var NUM_CONTENT      = $("#content-areas li").length;
        var STORAGE_KEY      = 'content';  //Local-Storage key
        var THUMBNAIL_SIZE   = 49;
        var PRESENAREA_INIT  = 'Display content here';
        var CONTENTAREA_INIT = 'Content ';
        var CONTENTAREA_MSG  = 'Click <br />';
        var NO_CONTENT       = 'No content !!';

        //Correspond to smartphone event
        var userAgent = navigator.userAgent;
        var click = '';
        var start = '';
        var move  = '';
        var end   = '';

        if(userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1 || userAgent.indexOf('iPod') !== -1 || userAgent.indexOf('Android') !== -1){
            //Smartphone or Tablet
            click = 'tap';
            start = 'touchstart';
            move  = 'touchmove';
            end   = 'touchend';
        }else {
            //Desktop
            click = 'click';
            start = 'mousedown';
            move  = 'mousemove';
            end   = 'mouseup';
        }

        //Shared page ?
        if(location.href.indexOf('share') !== -1){
            //Get presentation area size
            var width  = $("#receive-width").val();
            var height = $("#receive-height").val();

            //Initialization for presentation
            $("#presentation-area").text(PRESENAREA_INIT).css({
                width  : (width  + "px"),
                height : (height + "px")
            });

            //Set URL
            $("#url").attr("placeholder", location.href);

            //Send URL
            $(".send-url").live(click, function(){
                var hrefStr = 'mailto:?subject=' + encodeURIComponent('Your Page URL | Instant Canvas Presentation') + '&body=' + encodeURIComponent(location.href);
                $(this).attr("href", hrefStr).trigger("create");
            });

        }else {

            /*
             * Event Listener for Drawing
             */

            try{
                var artCanvas = ArtCanvas('canvas');  //Closure
                artCanvas.draw(start, move, end);  //Set event handler
            }catch(error){
                window.alert(error.message);
            }

            //Initialization for presentation
            $("#presentation-area").text(PRESENAREA_INIT).css({
                width  : (artCanvas.canvas.width  + "px"),
                height : (artCanvas.canvas.height + "px")
            });

            for(var i = 0; i < NUM_CONTENT; i++)$("#content-area" + i).text(CONTENTAREA_INIT + i);

            //Canvas size (width)
            $("#canvas-width-slider").live('change', function(){
                //var rate = $(this).val() / artCanvas.canvas.width;
                var prevImage = artCanvas.context.getImageData(0, 0, artCanvas.canvas.width, artCanvas.canvas.height);

                artCanvas.canvas.width = Number($(this).val());
                artCanvas.context.putImageData(prevImage, 0, 0, artCanvas.canvas.width, artCanvas.canvas.height);

                $("#presentation-area").css("width", $(this).val() + "px");
            });

            //Canvas size (height)
            $("#canvas-height-slider").live('change', function(){
                //var rate = $(this).val() / artCanvas.canvas.height;
                var prevImage = artCanvas.context.getImageData(0, 0, artCanvas.canvas.width, artCanvas.canvas.height);

                artCanvas.canvas.height = Number($(this).val());
                artCanvas.context.putImage(prevImage, 0, 0, artCanvas.canvas.width, artCanvas.canvas.height);

                $("#presentation-area").css("height", $(this).val() + "px");
            });

            //Grid
            $('form[name="grid-size"] :radio').bind(click, function(){
                var gridSizes = [10, 30, 50, 100];

                for(var i = 0, len = gridSizes.length; i < len; i++)$("#canvas").removeClass("canvas-grid" + gridSizes[i]);

                if($(this).is(":checked"))$("#canvas").addClass('canvas-grid' + $(this).val());
            });

            //Undo
            $("#undo").live(click, function(){
                artCanvas.undo(function(){
                    window.alert('Cannot Undo !!');
                });
            });

            //Redo
            $("#redo").live(click, function(){
                artCanvas.redo(function(){
                    window.alert('Cannot Redo !!');
                });
            });

            $("#eraser").live(click, function(){
                var onCallback = function(){
                    $("#eraser").parent().addClass('eraser-on');
                    $("#current-mode div").text($("#current-mode div").text() + SHOW_MODES.ERASER);
                };

                var offCallback = function(){
                    $("#eraser").parent().removeClass('eraser-on');
                    $("#current-mode div").text($("#current-mode div").text().replace(' E', ''));
                };

                artCanvas.erase(offCallback, onCallback);
            });

            //Clear canvas data
            $("#clear").live(click, function(){
                var confirmCallback = function(){
                    return window.confirm('Erase canvas data ?');
                };

                artCanvas.clear(confirmCallback);
            });

            //Pen type
            $("#pen-type").live('change', function(){
                artCanvas.context.lineCap = $(this).val();
            });

            //Line width
            $("#width-slider").live('change', function(){
                artCanvas.context.lineWidth = Number($(this).val());
            });

            //Alpha-Channel
            $("#alpha-slider").live('change', function(){
                artCanvas.context.globalAlpha = Number($(this).val());
            ;});

            //Shadow size config
            $("#shadow-size-slider").live('change', function(){
                artCanvas.context.shadowBlur = Number($(this).val());
            });

            //Color (<input type="color">)
            $("#color-form").live('change', function(){
                var hexToDecimal = function(hexStr){
                    switch(hexStr.toUpperCase()){
                        case 'A' : return 10;
                        case 'B' : return 11;
                        case 'C' : return 12;
                        case 'D' : return 13;
                        case 'E' : return 14;
                        case 'F' : return 15;
                        default : return Number(hexStr);
                    }
                }

                if($("#color-type").val() === 'pen'){
                    //Set pen-color
                    $("#current-pen-color .ui-bar").css("border-color", $(this).val());
                    artCanvas.context.strokeStyle = $(this).val();  //Set color(stroke)
                    artCanvas.context.fillStyle   = $(this).val();  //Set color(fill)

                    //Get RGB Values (for gradient)
                    var colorStr = $(this).val().replace('#', '');
                    var rgbs     = ['r', 'g', 'b'];

                    for(var i = 0, len = rgbs.length; i < len; i++){
                        var hex   = colorStr.slice((i * 2), (i * 2 + 2));
                        var value = (hexToDecimal(hex.slice(0, 1)) * Math.pow(16, 1)) + (hexToDecimal(hex.slice(1, 2)) * Math.pow(16, 0));
                        artCanvas.setRGB(rgbs[i], value);
                    }
                }else {
                    //Set shadow-color
                    $("#current-shadow-color .ui-bar").css("border-color", $(this).val());
                    artCanvas.context.shadowColor = $(this).val();
                }
            });

            //Color
            $("#color-picker li").live(click, function(){
                var color = $(this).css("background-color");

                if($("#color-type").val() === 'pen'){
                    //Set pen-color
                    $("#current-pen-color .ui-bar").css("border-color", color);
                    artCanvas.context.strokeStyle = color;  //Set color(stroke)
                    artCanvas.context.fillStyle   = color;    //Set color(fill)

                    //Get RGB Values (for gradient)
                    var colorStr = color.replace('rgb(', '').replace(')', '');
                    var colors   = colorStr.split(',');
                    artCanvas.setRGB('r', colors[0]);
                    artCanvas.setRGB('g', colors[1]);
                    artCanvas.setRGB('b', colors[2]);
                }else {
                    //Set shadow-color
                    $("#current-shadow-color .ui-bar").css("border-color", color);
                    artCanvas.context.shadowColor = color;
                }
            });

            //Change to Figure mode
            $("#change-figure-mode h2").bind(click, function(){
                if(artCanvas.getMode() === 'figure'){
                    //Change to Illust mode
                    artCanvas.setMode('illust');
                    //Change UI
                    $("#canvas").removeClass("illust figure text dropper translate zoom-in zoom-out rotate").addClass("illust");
                    $("#current-mode div").text(SHOW_MODES.ILLUST);
                }else {
                    //Change to Figure mode
                    artCanvas.setMode('figure');
                    //Change UI
                    $("#canvas").removeClass("illust figure text dropper translate zoom-in zoom-out rotate").addClass("figure");
                    $("#current-mode div").text(SHOW_MODES.FIGURE);
                }

                //Eraser OFF
                $("#eraser").parent().removeClass('eraser-on');
            });

            //Select figure
            $("#select-figure").live('change', function(){
                if(artCanvas.getMode() === 'figure')artCanvas.setFigure($(this).val());
            });

            //Change to Text mode
            $("#change-text-mode h2").bind(click, function(){
                if(artCanvas.getMode() === 'text'){
                    //Change to Illust mode
                    artCanvas.setMode('illust');
                    //Change UI
                    $("#canvas").removeClass("illust figure text dropper translate zoom-in zoom-out rotate").addClass("illust");
                    $("#current-mode div").text(SHOW_MODES.ILLUST);
                }else {
                    //Change to Text mode
                    artCanvas.setMode('text');
                    //Change UI
                    $("#canvas").removeClass("illust figure text dropper translate zoom-in zoom-out rotate").addClass("text");
                    $("#current-mode div").text(SHOW_MODES.TEXT);
                }

                //Eraser OFF
                $("#eraser").parent().removeClass('eraser-on');
            });

            //font-size config
            $("#font-size-slider").live('change', function(){
                if(artCanvas.getMode() === 'text'){
                    var font = artCanvas.context.font.replace(/\d+px/, $(this).val() + 'px');
                    artCanvas.context.font = font;
                }
            });

            //font-family config
            $("#select-font-family").live('change', function(){
                if(artCanvas.getMode() === 'text'){
                    var font = artCanvas.context.font.replace(/(.*px\s).*/, '$1' + $(this).val());
                    artCanvas.context.font = font;
                }
            });

            //Text input
            $("#text-input").live('blur', function(){
                if(artCanvas.getMode() === 'text')artCanvas.setText($(this).val());
            });

            //Change to Tool mode
            $("#change-tool-mode h2").bind(click, function(){
                if(artCanvas.getMode() === 'tool'){
                    //Change to Illust mode
                    artCanvas.setMode('illust');
                    //Change UI
                    $("#canvas").removeClass("illust figure text dropper translate zoom-in zoom-out rotate").addClass("illust");
                    $("#current-mode div").text(SHOW_MODES.ILLUST);
                }else {
                    //Change to Tool mode
                    artCanvas.setMode('tool');
                    //Change UI
                    $("#canvas").removeClass("illust figure text dropper translate zoom-in zoom-out rotate").addClass(artCanvas.getTool());
                    $("#current-mode div").text(SHOW_MODES.TOOL);
                }

                //Eraser OFF
                $("#eraser").parent().removeClass('eraser-on');
            });

            //Cange to Tool mode
            $("#select-tool").live('change', function(){
                if(artCanvas.getMode() === 'tool'){
                    switch($(this).val()){
                        case 'dropper' :
                            artCanvas.setTool('dropper');
                            $("#canvas").removeClass("illust figure text dropper translate zoom-in zoom-out rotate").addClass("dropper");
                            break;
                        case 'translate' :
                            artCanvas.setTool('translate');
                            $("#canvas").removeClass("illust figure text dropper translate zoom-in zoom-out rotate").addClass("translate");
                            break;
                        case 'zoom-in' :
                            artCanvas.setTool('zoom-in');
                            $("#canvas").removeClass("illust figure text dropper translate zoom-in zoom-out rotate").addClass("zoom-in");
                            break;
                        case 'zoom-out' :
                            artCanvas.setTool('zoom-out');
                            $("#canvas").removeClass("illust figure text dropper translate zoom-in zoom-out rotate").addClass("zoom-out");
                            break;
                        case 'rotate' :
                            artCanvas.setTool('rotate');
                            $("#canvas").removeClass("illust figure text dropper translate zoom-in zoom-out rotate").addClass("rotate");
                            break;
                    }
                }

                //Eraser OFF
                $("#eraser").parent().removeClass('eraser-on');
            });

            //Dropper, Zoon in / Zoom out, Rotate
            $("#canvas").live(click, function(event){
                if(artCanvas.getMode() === 'tool'){
                    switch(artCanvas.getTool()){
                        case 'dropper' :
                            artCanvas.pickRGB(event);

                            var r     = artCanvas.getRGB('r');
                            var g     = artCanvas.getRGB('g');
                            var b     = artCanvas.getRGB('b');
                            var color = 'rgb(' + r +', ' + g + ', ' + b + ')';

                            if($("#color-type").val() === 'pen'){
                                //Set pen-color
                                $("#current-pen-color .ui-bar").css("border-color", color);
                                artCanvas.context.strokeStyle = color;  //Set color(stroke)
                                artCanvas.context.fillStyle   = color;    //Set color(fill)
                            }else {
                                //Set shadow-color
                                $("#current-shadow-color .ui-bar").css("border-color", color);
                                artCanvas.context.shadowColor = color;
                            }

                            break;
                        case 'zoom-in' :
                            artCanvas.scale(2, 2);
                            break;
                        case 'zoom-out' :
                            artCanvas.scale(0.5, 0.5);
                            break;
                        case 'rotate' :
                            artCanvas.rotate(90);
                            break;
                    }
                }
            });

            //Image load
            $("#upload-mask-image").live(click, function(){
                $("#upload-image").click();
                $("#upload-image").change(function(event){
                    try {
                        artCanvas.loadImage(event, function(file){
                            $("#upload-mask-image").val(file.name);
                        });
                    }catch(error){
                        window.alert(error.message);
                    }
                });
            });

            //Image filter
            $("#run-filter").live(click, function(){
                artCanvas.runFilter($("#filter").val())
            });

            //Save (to presentation slide)
            $("#save-slide").live(click, function(){
                var dataURL    = artCanvas.getDataURL($("#select-format").val());
                var selectMenu = document.forms['fm-select-slide'].elements['select-slide'];
                var nth        = selectMenu.value;

                if(window.confirm('Save canvas data to the ' + (selectMenu.options[selectMenu.selectedIndex].text) + ' for presentation ?')){
                    //Contents already exist in selected slide ?
                    if($("#content-area" + nth).html().indexOf('img') !== -1){
                        //Overwrite ?
                        if(window.confirm('The ' + (selectMenu.options[selectMenu.selectedIndex].text) + ' already exists !! Overwrite ?')){
                            //Overwrite
                        }else {
                            return;  //Cancel overwrite
                        }
                    }else {
                        //No contents
                    }

                    //Save
                    $("#content-area" + nth).html(CONTENTAREA_MSG + '<img src="' + dataURL + '" />').addClass("content-on");
                    $("#content-area" + nth + " img").attr("width", THUMBNAIL_SIZE).attr("height", THUMBNAIL_SIZE).attr("draggable", true);
               }
            });

            //Download
            $("#download").live(click, function(){
                window.open(artCanvas.getDataURL($("#select-format").val()), 'Save Canvas Data');
            });
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////

        /*
         * Event listener for presentation
         */

        //Loccal-Storage
        $(window).load(function(){
            for(var i = 0; i < NUM_CONTENT; i++){
                //Local-Storage ?
                document.getElementById('content-area' + i).innerHTML = window.localStorage.getItem(STORAGE_KEY + i) || CONTENTAREA_INIT + (i + 1);

                if($("#content-area" + i).html().indexOf('img') !== -1)$("#content-area" + i).attr("draggable", true).addClass("content-on");
            }
        });

        $(window).unload(function(){
            if(window.localStorage){
                for(var i = 0; i < NUM_CONTENT; i++){
                    if($("#content-area" + i).html().indexOf('img') !== -1)window.localStorage.setItem(STORAGE_KEY + i, $("#content-area" + i).html());
                }
            }
        });

        /*
         * jQuery's event object does not have property for Drag & Drop.
         */

        for(var i = 0; i < NUM_CONTENT; i++){

            document.getElementById('content-area' + i).addEventListener('dragstart', function(event){
                event.stopPropagation();

                //Content exists ?
                if(this.innerHTML.indexOf('img') !== -1)event.dataTransfer.setData('text/plain', event.currentTarget.id);
            }, false);

            document.getElementById('content-area' + i).addEventListener('dragenter', function(event){
                event.preventDefault();
                this.classList.add('content-over');
            }, false);

            document.getElementById('content-area' + i).addEventListener('dragover', function(event){
                event.preventDefault();
            }, false);

            document.getElementById('content-area' + i).addEventListener('dragleave', function(event){
                //event.preventDefault();
                this.classList.remove('content-over');
            }, false);

            document.getElementById('content-area' + i).addEventListener('drop', function(event){
                event.preventDefault();

                var MAX_UPLOAD_SIZE = 5 * Math.pow(10, 6);  //Max upload size (5 MB)

                var file   = null;  //File object
                var reader = null;  //FileReader object
                var self   = this;

                if(event.dataTransfer.types[0] === 'text/plain'){
                    //Browser -> Browser
                    //Get node
                    var swapArea = document.getElementById(event.dataTransfer.getData('text/plain'));
                    //Swap content
                    var swapContent = this.innerHTML;
                    this.innerHTML = swapArea.innerHTML;
                    swapArea.innerHTML = swapContent;

                    //Enable drag
                    this.setAttribute('draggable', true);

                    //Change style (drop area node)
                    this.classList.remove('content-over');
                    this.classList.add('content-on');

                    //Change style (dragstart area node)
                    if(swapArea.innerHTML.indexOf('img') === -1)swapArea.classList.remove('content-on');

                    return;
                }else {
                    //Desktop -> Browser
                    //Get File object
                    file = event.dataTransfer.files[0];
                }

                //Get FileReader object
                reader = new FileReader();

                //FileReader event handler on progress
                reader.onprogress = function(event){
                    if(event.lengthComputable && (event.total > 0)){
                        var rate = (event.loaded * 100 / event.total).toFixed(1);
                        self.innerHTML = event.total + ' Bytes...<br />' + event.loaded + ' Bytes load (' + rate + ' %)';
                    }
                };

                //FileReader event handler on error
                reader.onerror = function(){
                    self.classList.remove('content-over');
                    window.alert('FileReader Error !! Error code is ' + reader.error.code);
                };

                if((file.type.indexOf('image') !== -1) && (file.size <= MAX_UPLOAD_SIZE)){
                    //Content already exists ?
                    if(this.innerHTML.indexOf('img') !== -1){
                        if(window.confirm('Content already exists !! Overwrite ?')){
                            //Overwrite
                        }else {
                            return;  //Cancel
                        }
                    }

                    //Read file as dataURL
                    reader.readAsDataURL(file);

                    //FileReader event handler on success
                    reader.onload = function(event){
                        self.innerHTML = CONTENTAREA_MSG + '<img src="' + reader.result + '" />';
                        self.lastChild.setAttribute('width',  THUMBNAIL_SIZE);
                        self.lastChild.setAttribute('height', THUMBNAIL_SIZE);
                        self.lastChild.setAttribute('draggable', true);
                        self.classList.remove('content-over');
                        self.classList.add('content-on');
                    };
                }else {
                    //Change default style
                    this.classList.remove('content-over');

                    if(file.type.indexOf('image') === -1){
                        //File is not image file
                        window.alert('Please drop image file !!');
                    }else if(file.size > MAX_UPLOAD_SIZE){
                        //Exceeds max upload size
                        window.alert('File size exceeds ' + (MAX_UPLOAD_SIZE / Math.pow(10, 6)) + ' MB !!');
                    }else {
                        //No file
                    }
                }
            }, false);

            document.getElementById('content-area' + i).addEventListener(click, function(event){
                //Content exists ?
                if(this.innerHTML.indexOf('img') !== -1){
                    //Set presentation content
                    $("#presentation-area img").removeClass("content-animation");
                    $("#presentation-area").html(this.innerHTML.replace(/.*(<img.*)/, '$1'));
                    $("#presentation-area img").attr("width", Number($("#presentation-area").css("width").replace('px', '')))
                                               .attr("height", Number($("#presentation-area").css("height").replace('px', '')));
                    $("#presentation-area img").addClass("content-animation");
                }else {
                    $("#presentation-area").text(NO_CONTENT);
                }
            }, false);
        }

        //Clear contents (and Local-Storage)
        $("#clear-contents").live(click, function(){
            if(window.confirm('Clear all contents. OK ?')){
                for(var i = 0; i < NUM_CONTENT; i++)$("#content-area" + i).text(CONTENTAREA_INIT + (i + 1)).attr('draggable', false).removeClass("content-on");

                if(window.confirm('Clear Local-Storage. OK ?'))window.localStorage.clear();
            }
        });

        //Create shared page
        $('form[name="fm-share-slide"]').submit(function(){
            var isContent = false;

            //Content exists ?
            for(var i = 0; i < NUM_CONTENT; i++){
                if($("#content-area" + i).html().indexOf('img') !== -1){
                    isContent = true;
                    break;
                }
            }

            //No contents
            if(isContent){
                //Begin Ajax

                //Content exists at least 1.
                if(window.confirm('If you upload much data size, making shared page will cost very long time. OK ?')){
                    var data      = '';
                    var xhr       = null;
                    var timerid   = null;
                    var scriptKey = 'dataURL';  //Referenced by server side script (share.php)

                    //Get data for sending to server side script
                    data = $("#shared-contents").html();
                    data += '<div><input type="hidden" id="receive-width" value="' + artCanvas.canvas.width + '" />';
                    data += '<input type="hidden" id="receive-height" value="' + artCanvas.canvas.height + '" /></div>';

                    //Ajax
                    xhr = new XMLHttpRequest();

                    timerid = window.setTimeout(function(){
                        xhr.abort();
                        window.alert('Timeout !! Please try again.');
                    }, 5000);

                    xhr.onreadystatechange = function(){
                        //Receiving
                        if(xhr.readyState === 3)$("#ajax-area").html('<img src="images/illust/gif/loadingAnimation.gif" alt="Now Loading..." width="208" height="13" />');

                        //Complete receiving data
                        if(xhr.readyState === 4){
                            window.clearTimeout(timerid);
                            if(xhr.status === 200){
                                $("#ajax-area").html('<a href="' + xhr.responseText + '" rel="external" data-role="button" data-transition="pop" data-icon="arrow-r" data-iconpos="right">Shared Page</a>').trigger("create");
                            }else {
                                window.alert('Server Error !!');
                            }
                        }
                    };

                    //Start Ajax
                    xhr.open('POST', location.protocol + '//' + location.host + '/portfolio-instant-canvas-presentation/php/share.php', true);
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                    xhr.send(scriptKey + '=' + encodeURIComponent(data));

                }else {
                    //window.confirm() -> false
                }
            }else {
                //No content
                window.alert('There is not content !!');
            }

            //for Ajax or event cancel
            return false;
        });

        /////////////////////////////////////////////////////////////////////////////////////////////////

        /*
         * jQuery for UI
         */

        //Tab-Panel
        $("#draw-setting, #color-setting, #mode-setting, #utility-setting").hide();
        $($(".selected").attr("href")).show();
        $("#panel-menu a").live(click, function(){
            $("#panel-menu a.selected").removeClass("selected");
            $(this).addClass("selected");
            $("#draw-setting, #color-setting, #mode-setting, #utility-setting").fadeOut("fast");
            $($(this).attr("href")).fadeIn("fast");

            return false;
        });

        /////////////////////////////////////////////////////////////////////////////////////////////////

    }, true);

})();
