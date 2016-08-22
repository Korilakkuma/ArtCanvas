describe('ArtCanvas TEST', function() {

    describe('ArtCanvas.prototype.getContainerWidth', function() {

        it('should return 800', function() {
            var container = document.createElement('div');
            var canvas    = document.createElement('canvas');

            container.appendChild(canvas);

            var artCanvas = new ArtCanvas(container, canvas, 800.5, 600, {});

            expect(artCanvas.getContainerWidth()).toEqual(800);
        });

    });

});
