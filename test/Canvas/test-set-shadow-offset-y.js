describe('Canvas TEST', function() {

    describe('Canvas.prototype.setShadowOffsetY', function() {

        var canvas = new Canvas(null, null, 300, 300, 1);

        afterEach(function() {
            canvas.setShadowOffsetY(0);
        });

        // Positive

        it('should return 0.5', function() {
            canvas.setShadowOffsetY(0.5);
            expect(canvas.getShadowOffsetY()).toEqual(0.5);
        });

        it('should return -0.5', function() {
            canvas.setShadowOffsetY(-0.5);
            expect(canvas.getShadowOffsetY()).toEqual(-0.5);
        });

        // Negative

        it('should return 0', function() {
            canvas.setShadowOffsetY('');
            expect(canvas.getShadowOffsetY()).toEqual(0);
        });

    });

});
