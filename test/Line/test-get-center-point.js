describe('Line TEST', function() {

    describe('Line.prototype.getCenterPoint', function() {

        it('should return the instance of Point', function() {
            var line  = new Line(new Mocks.ArtCanvas.Point(-0.5, -0.5), new Mocks.ArtCanvas.Point(0.5, 0.5));
            var point = line.getCenterPoint()

            expect(point).toEqual(jasmine.any(Mocks.ArtCanvas.Point));
            expect(point.getX()).toEqual(0);
            expect(point.getY()).toEqual(0);
        });

    });

});
