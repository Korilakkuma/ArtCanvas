describe('Eraser TEST', function() {

    describe('Eraser.prototype.getY', function() {

        // Positive

        it('should return 0.5', function() {
            var eraser = new Eraser(new Mocks.ArtCanvas.Point(1, 0.5));

            expect(eraser.getY()).toEqual(0.5);
        });

        // Negative

        it('should return 0', function() {
            var eraser = new Eraser(null);

            expect(eraser.getY()).toEqual(0);
        });

    });

});
