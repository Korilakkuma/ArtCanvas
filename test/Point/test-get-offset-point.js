describe('Point TEST', function() {

    describe('Point.getOffsetPoint', function() {

        // Positive

        it('should return the instance of Point', function() {
            var point1 = new Point(-1, -1);
            var point2 = new Point(1, 1);
            var point  = Point.getOffsetPoint(point1, point2);

            expect(point).toEqual(jasmine.any(Point));
            expect(point.getX()).toEqual(2);
            expect(point.getY()).toEqual(2);
        });

        // Negative

        it('should return the instance of Point', function() {
            var point = Point.getOffsetPoint(null, null);

            expect(point).toEqual(jasmine.any(Point));
            expect(point.getX()).toEqual(0);
            expect(point.getY()).toEqual(0);
        });

    });

});
