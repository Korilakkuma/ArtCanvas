describe('Color TEST', function() {

    describe('Color.prototype.getAlpha', function() {

        // Positive

        it('should return 0.5', function() {
            var color = new Color(0, 0, 0, 0.5);

            expect(color.getAlpha()).toEqual(0.5);
        });

        // Negative

        it('should return 1', function() {
            var color = new Color(-1, -1, -1, -0.1);

            expect(color.getAlpha()).toEqual(1);
        });

        it('should return 1', function() {
            var color = new Color(256, 256, 256, 1.1);

            expect(color.getAlpha()).toEqual(1);
        });

    });

});
