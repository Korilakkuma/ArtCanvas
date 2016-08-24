describe('Point TEST', function() {

    describe('Point.getDistance', function() {

        it('should return the instance of Point', function() {
            var point1   = new Point(-1, -1);
            var point2   = new Point(1, 1);
            var distance = Point.getDistance(point1, point2);

            expect(distance).toEqual(2 * Math.sqrt(2));
        });

    });

});
