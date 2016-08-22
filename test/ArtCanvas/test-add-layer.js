describe('ArtCanvas TEST', function() {

    describe('ArtCanvas.prototype.addLayer', function() {

        var container = document.createElement('div');
        var canvas    = document.createElement('canvas');

        container.appendChild(canvas);

        var artCanvas = new ArtCanvas(container, canvas, 800, 600, {});

        artCanvas.addLayer(800, 600);

        it('should return 2', function() {
            expect(artCanvas.layers.length).toEqual(2);
        });

        it('should return true', function() {
            expect(artCanvas.layers[1]).toEqual(jasmine.any(Mocks.ArtCanvas.Canvas));
        });

    });

});
