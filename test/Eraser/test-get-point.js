describe('Eraser TEST', function() {

    describe('Eraser.prototype.getPoint', function() {

        // Positive

        it('should return the instance of Point', function() {
            var eraser = new Eraser(new Mocks.ArtCanvas.Point(0.5, 1.5));
            var point  = eraser.getPoint();

            expect(point).toEqual(jasmine.any(Mocks.ArtCanvas.Point));
            expect(point.getX()).toEqual(0.5);
            expect(point.getY()).toEqual(1.5);
        });

        // Negative

        it('should return the instance of Point', function() {
            var eraser = new Eraser(null);
            var point  = eraser.getPoint();

            expect(point).toEqual(jasmine.any(Mocks.ArtCanvas.Point));
            expect(point.getX()).toEqual(0);
            expect(point.getY()).toEqual(0);
        });

    });

});
