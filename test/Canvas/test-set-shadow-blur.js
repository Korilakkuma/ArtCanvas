describe('Canvas TEST', function() {

    describe('Canvas.prototype.setShadowBlur', function() {

        var canvas = new Canvas(null, null, 300, 300, 1);

        // Positive

        it('should return 0.5', function() {
            canvas.setShadowBlur(0.5);
            expect(canvas.getShadowBlur()).toEqual(0.5);
        });

        it('should return 0', function() {
            canvas.setShadowBlur(0);
            expect(canvas.getShadowBlur()).toEqual(0);
        });

        // Negative

        it('should return 0', function() {
            canvas.setShadowBlur(-0.1);
            expect(canvas.getShadowBlur()).toEqual(0);
        });

    });

});
