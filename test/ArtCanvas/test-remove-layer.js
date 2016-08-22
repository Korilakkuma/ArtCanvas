describe('ArtCanvas TEST', function() {

    describe('ArtCanvas.prototype.removeLayer', function() {

        var container = document.createElement('div');
        var canvas    = document.createElement('canvas');

        container.appendChild(canvas);

        var artCanvas = new ArtCanvas(container, canvas, 800, 600, {});

        it('should return 0', function() {
            artCanvas.addLayer(800, 600).removeLayer(1);
            expect(artCanvas.getActiveLayer()).toEqual(0);
            // expect(artCanvas.layers.length).toEqual(1);
        });

        it('should return 1', function() {
            artCanvas.addLayer(800, 600).addLayer(800, 600).removeLayer(0);
            expect(artCanvas.getActiveLayer()).toEqual(1);
            // expect(artCanvas.layers.length).toEqual(2);
        });

    });

});
