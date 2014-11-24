$(function() {

    var WIDTH  = 480;
    var HEIGHT = 480;

    var PALLETE = [
        ['rgb(255,   0, 0)', 'rgb(  0, 255,   0)', 'rgb(  0,   0, 255)'],
        ['rgb(255, 255, 0)', 'rgb(  0, 255, 255)', 'rgb(255,   0, 255)'],
        ['rgb(  0,   0, 0)', 'rgb(127, 127, 127)', 'rgb(255, 255, 255)']
    ];

    var canvas    = document.querySelector('canvas');
    var container = canvas.parentNode;

    var artCanvas = new ArtCanvas(container, canvas, WIDTH, HEIGHT);

    var callbacks = {
        drawstart   : function() {},
        drawmove    : function() {},
        drawend     : function() {},
        changemode  : function() {
            
        },
        selectlayer : function() {},
        showlayer   : function() {},
        hidelayer   : function() {},
        addlayer    : function(activeCanvas, activeLayer) {
            activeLayer++;

            var dd = $('<dd />').append('<input type="checkbox" value="' + activeLayer + '" checked />')
                                .append('<label><input type="radio" name="radio-layer" value="' + activeLayer + '" checked />Layer ' + activeLayer + '</label>');
            $('#button-add-layer').parent('dd').after(dd);
        },
        removelayer : function() {}
    };

    var setTextStyle = function() {
        var fontFamily = $('#select-font-family').val();
        var fontStyle  = $('#select-font-style').val();
        var fontSize   = $('#number-font-size').val() + 'px';

        var font  = new ArtCanvas.Font(fontFamily, fontStyle, fontSize);

        var tinycolor = $('#colorpicker-text').spectrum('get');
        var color       = tinycolor.toRgbString();

        artCanvas.setTextStyle(new ArtCanvas.TextStyle(font, color));
    };

    artCanvas.setCallbacks(callbacks);

    $('[name="form-layer"]').on(ArtCanvas.MouseEvents.CLICK, '[type="checkbox"]', function() {
        var layerNumber = parseInt(this.value) - 1;

        if (this.checked) {
            artCanvas.showLayer(layerNumber);
        } else {
            artCanvas.hideLayer(layerNumber);
        }
    });

    $('[name="form-layer"]').on(ArtCanvas.MouseEvents.CLICK, '[type="radio"]', function() {
        artCanvas.selectLayer(parseInt(this.value) - 1);
    });

    $('#button-add-layer').on(ArtCanvas.MouseEvents.CLICK, function() {
        artCanvas.addLayer(WIDTH, HEIGHT);
    });

    $('#colorpicker-fill').spectrum({
        preferredFormat      : 'rgb',
        //color                : 'rgba(0, 0, 0, 1.0)',
        allowEmpty           : true,
        showInput            : true,
        showAlpha            : true,
        showPalette          : true,
        pallete              : PALLETE,
        showSelectionPalette : true,
        hide                 : function(color) {
            artCanvas.setFillStyle(color.toRgbString());
        }
    });

    $('#colorpicker-stroke').spectrum({
        preferredFormat      : 'rgb',
        color                : 'rgba(0, 0, 0, 1.0)',
        allowEmpty           : true,
        showInput            : true,
        showAlpha            : true,
        showPalette          : true,
        pallete              : PALLETE,
        showSelectionPalette : true,
        hide                 : function(color) {
            artCanvas.setStrokeStyle(color.toRgbString());
        }
    });

    $('#number-line-width').change(function() {
        artCanvas.setLineWidth(this.valueAsNumber);
    });

    $('#checkbox-text-mode').on(ArtCanvas.MouseEvents.CLICK, function() {
        if (this.checked) {
            artCanvas.setMode(ArtCanvas.Mode.TEXT);
        } else {
            artCanvas.setMode(ArtCanvas.Mode.HAND);
        }
    });

    $('#select-font-family, #select-font-style, #number-font-size').change(function() {
        setTextStyle();
    });

    $('#colorpicker-text').spectrum({
        preferredFormat      : 'rgb',
        color                : 'rgba(0, 0, 0, 1.0)',
        showInput            : true,
        showAlpha            : true,
        showPalette          : true,
        pallete              : PALLETE,
        showSelectionPalette : true,
        hide                 : function(color) {
            setTextStyle();
        }
    });

    $('#select-figure').change(function() {
        if (artCanvas.getMode() === ArtCanvas.Mode.TEXT) {
            $('#checkbox-text-mode').trigger(ArtCanvas.MouseEvents.CLICK);
        }

        if (this.value === '') {
            artCanvas.setMode(ArtCanvas.Mode.HAND);
        } else {
            artCanvas.setMode(ArtCanvas.Mode.FIGURE);
            artCanvas.setFigure(this.value);
        }
    });

    $('#select-transform').change(function() {
        if (artCanvas.getMode() === ArtCanvas.Mode.TEXT) {
            $('#checkbox-text-mode').trigger(ArtCanvas.MouseEvents.CLICK);
        }

        if (this.value === '') {
            artCanvas.setMode(ArtCanvas.Mode.HAND);
        } else {
            artCanvas.setMode(ArtCanvas.Mode.TRANSFORM);
            artCanvas.setTransform(this.value);
        }
    });
});
