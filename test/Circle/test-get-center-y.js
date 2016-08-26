describe('Circle TEST', function() {

    describe('Circle.prototype.getCenterY', function() {

        // Positive

        it('should return 0.5', function() {
            var circle = new Circle(1, 0.5, 1);

            expect(circle.getCenterY()).toEqual(0.5);
        });

        // Negative

        it('should return 0', function() {
            var circle = new Circle(1, '', 1);

            expect(circle.getCenterY()).toEqual(0);
        });

    });

});
