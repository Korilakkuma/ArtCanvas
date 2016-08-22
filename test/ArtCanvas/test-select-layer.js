describe('ArtCanvas TEST', function() {

    describe('ArtCanvas.prototype.selectLayer', function() {

        var container = document.createElement('div');
        var canvas    = document.createElement('canvas');

        container.appendChild(canvas);

        var artCanvas = new ArtCanvas(container, canvas, 800, 600, {});

        artCanvas.addLayer(800, 600)
                 .addLayer(800, 600)
                 .addLayer(800, 600);

        afterEach(function() {
            artCanvas.selectLayer(0);
        });

        // Positive

        it('should return 0', function() {
            artCanvas.selectLayer(0);
            expect(artCanvas.getActiveLayer()).toEqual(0);
        });

        it('should return 3', function() {
            artCanvas.selectLayer(3);
            expect(artCanvas.getActiveLayer()).toEqual(3);
        });

        // Negative

        it('should return 0', function() {
            artCanvas.selectLayer(4);
            expect(artCanvas.getActiveLayer()).toEqual(0);
        });

    });

});
