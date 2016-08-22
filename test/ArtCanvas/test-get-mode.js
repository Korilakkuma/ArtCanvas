describe('ArtCanvas TEST', function() {

    describe('ArtCanvas.prototype.getMode', function() {

        it('should return "hand"', function() {
            var container = document.createElement('div');
            var canvas    = document.createElement('canvas');

            container.appendChild(canvas);

            var artCanvas = new ArtCanvas(container, canvas, 800, 600, {});

            expect(artCanvas.getMode()).toEqual('hand');
        });

    });

});
