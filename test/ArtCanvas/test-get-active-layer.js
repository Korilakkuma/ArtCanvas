describe('ArtCanvas TEST', function() {

    describe('ArtCanvas.prototype.getActiveLayer', function() {

        var container = document.createElement('div');
        var canvas    = document.createElement('canvas');

        container.appendChild(canvas);

        var artCanvas = new ArtCanvas(container, canvas, 800, 600, {});

        // Initial
        it('should return 0', function() {
            expect(artCanvas.getActiveLayer()).toEqual(0);
        });

        it('should return 1', function() {
            artCanvas.addLayer(800, 600);
            expect(artCanvas.getActiveLayer()).toEqual(1);
        });

    });

});
