describe('ArtCanvas TEST', function() {

    describe('ArtCanvas.prototype.getContainerHeight', function() {

        it('should return 600', function() {
            var container = document.createElement('div');
            var canvas    = document.createElement('canvas');

            container.appendChild(canvas);

            var artCanvas = new ArtCanvas(container, canvas, 800, 600.5, {});

            expect(artCanvas.getContainerHeight()).toEqual(600);
        });

    });

});
