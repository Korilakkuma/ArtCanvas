describe('Color TEST', function() {

    describe('Color.prototype.toHexString', function() {

        // Positive

        it('should return "#4080ff"', function() {
            var color = new Color(64.5, 128.5, 255.5, 1);

            expect(color.toHexString()).toEqual('#4080ff');
        });

        // Negative

        it('should return "#000"', function() {
            var color = new Color(-1, -1, -1, -0.1);

            expect(color.toHexString()).toEqual('#000');
        });

        it('should return "#000"', function() {
            var color = new Color(256, 256, 256, 1.1);

            expect(color.toHexString()).toEqual('#000');
        });

    });

});
