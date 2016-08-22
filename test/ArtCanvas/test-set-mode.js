describe('ArtCanvas TEST', function() {

    describe('ArtCanvas.prototype.setMode', function() {

        var container = document.createElement('div');
        var canvas    = document.createElement('canvas');

        container.appendChild(canvas);

        var artCanvas = new ArtCanvas(container, canvas, 800, 600, {});

        afterEach(function() {
            artCanvas.setMode(Mocks.ArtCanvas.Mode.HAND);
        });

        // Positive

        it('should return "figure"', function() {
            expect(artCanvas.setMode(Mocks.ArtCanvas.Mode.FIGURE).getMode()).toEqual('figure');
        });

        it('should return "eraser"', function() {
            expect(artCanvas.setMode(Mocks.ArtCanvas.Mode.ERASER).getMode()).toEqual('eraser');
        });

        it('should return "transform"', function() {
            expect(artCanvas.setMode(Mocks.ArtCanvas.Mode.TRANSFORM).getMode()).toEqual('transform');
        });

        it('should return "tool"', function() {
            expect(artCanvas.setMode(Mocks.ArtCanvas.Mode.TOOL).getMode()).toEqual('tool');
        });

        it('should return "text"', function() {
            expect(artCanvas.setMode(Mocks.ArtCanvas.Mode.TEXT).getMode()).toEqual('text');
        });

        // Negative

        it('should return "hand"', function() {
            expect(artCanvas.setMode('dummy').getMode()).toEqual('hand');
        });

    });

});
