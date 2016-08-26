describe('Circle TEST', function() {

    describe('Circle.prototype.getRadius', function() {

        // Positive

        it('should return 0.5', function() {
            var circle = new Circle(1, 1, 0.5);

            expect(circle.getRadius()).toEqual(0.5);
        });

        // Negative

        it('should return 0', function() {
            var circle = new Circle(1, 1, -0.5);

            expect(circle.getRadius()).toEqual(0);
        });

        it('should return 0', function() {
            var circle = new Circle(1, 1, '');

            expect(circle.getRadius()).toEqual(0);
        });

    });

});
