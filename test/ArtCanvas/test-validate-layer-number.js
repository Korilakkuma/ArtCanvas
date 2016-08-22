describe('ArtCanvas TEST', function() {

    describe('ArtCanvas.prototype.validateLayerNumber', function() {

        var container = document.createElement('div');
        var canvas    = document.createElement('canvas');

        container.appendChild(canvas);

        var artCanvas = new ArtCanvas(container, canvas, 800, 600, {});

        artCanvas.addLayer(800, 600)
                 .addLayer(800, 600)
                 .addLayer(800, 600);

        // Positive

        it('should return true', function() {
            expect(artCanvas.validateLayerNumber(0)).toBeTruthy();
            expect(artCanvas.validateLayerNumber(3)).toBeTruthy();
        });

        // Negative

        it('should return false', function() {
            expect(artCanvas.validateLayerNumber(-1)).toBeFalsy();
            expect(artCanvas.validateLayerNumber(4)).toBeFalsy();
        });

    });

});
