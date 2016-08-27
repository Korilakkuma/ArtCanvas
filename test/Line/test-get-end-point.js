describe('Line TEST', function() {

    describe('Line.prototype.getEndPoint', function() {

        // Positive

        it('should return the instance of Point', function() {
            var line  = new Line(new Mocks.ArtCanvas.Point(-1, -1), new Mocks.ArtCanvas.Point(1, 1));
            var point = line.getEndPoint();

            expect(point).toEqual(jasmine.any(Mocks.ArtCanvas.Point));
            expect(point.getX()).toEqual(1);
            expect(point.getY()).toEqual(1);
        });

        // Negative

        it('should return the instance of Point', function() {
            var line  = new Line(new Mocks.ArtCanvas.Point(1, 1), null);
            var point = line.getEndPoint();

            expect(point).toEqual(jasmine.any(Mocks.ArtCanvas.Point));
            expect(point.getX()).toEqual(0);
            expect(point.getY()).toEqual(0);
        });

    });

});
