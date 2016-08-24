describe('Point TEST', function() {

    describe('Point.prototype.getY', function() {

        // Positive

        it('should return 0.5', function() {
            var point = new Point(1, 0.5);

            expect(point.getY()).toEqual(0.5);
        });

        // Negative

        it('should return 0', function() {
            var point = new Point(1, '');

            expect(point.getY()).toEqual(0);
        });

    });

});
