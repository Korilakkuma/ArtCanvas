describe('Point TEST', function() {

    describe('Point.prototype.getX', function() {

        // Positive

        it('should return 0.5', function() {
            var point = new Point(0.5, 1);

            expect(point.getX()).toEqual(0.5);
        });

        // Negative

        it('should return 0', function() {
            var point = new Point('', 1);

            expect(point.getX()).toEqual(0);
        });

    });

});
