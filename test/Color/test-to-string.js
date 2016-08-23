describe('Color TEST', function() {

    describe('Color.prototype.toString', function() {

        // Positive

        it('should return "rgba(64, 128, 255, 0.5)"', function() {
            var color = new Color(64.5, 128.5, 255.5, 0.5);

            expect(color.toString()).toEqual('rgba(64, 128, 255, 0.5)');
        });

        // Negative

        it('should return "rgba(0, 0, 0, 1)"', function() {
            var color = new Color(-1, -1, -1, -0.1);

            expect(color.toString()).toEqual('rgba(0, 0, 0, 1)');
        });

        it('should return "rgba(0, 0, 0, 1)"', function() {
            var color = new Color(256, 256, 256, 1.1);

            expect(color.toString()).toEqual('rgba(0, 0, 0, 1)');
        });

    });

});
