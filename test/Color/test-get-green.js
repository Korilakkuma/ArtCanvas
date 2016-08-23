describe('Color TEST', function() {

    describe('Color.prototype.getGreen', function() {

        // Positive

        it('should return 128', function() {
            var color = new Color(0, 128.5, 0, 0);

            expect(color.getGreen()).toEqual(128);
        });

        // Negative

        it('should return 0', function() {
            var color = new Color(-1, -1, -1, -0.1);

            expect(color.getGreen()).toEqual(0);
        });

        it('should return 0', function() {
            var color = new Color(256, 256, 256, 1.1);

            expect(color.getGreen()).toEqual(0);
        });

    });

});
