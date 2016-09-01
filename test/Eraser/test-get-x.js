describe('Eraser TEST', function() {

    describe('Eraser.prototype.getX', function() {

        // Positive

        it('should return 0.5', function() {
            var eraser = new Eraser(new Mocks.ArtCanvas.Point(0.5, 1));

            expect(eraser.getX()).toEqual(0.5);
        });

        // Negative

        it('should return 0', function() {
            var eraser = new Eraser(null);

            expect(eraser.getX()).toEqual(0);
        });

    });

});
