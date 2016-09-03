describe('Canvas TEST', function() {

    describe('Canvas.prototype.setShadowOffsetX', function() {

        var canvas = new Canvas(null, null, 300, 300, 1);

        afterEach(function() {
            canvas.setShadowOffsetX(0);
        });

        // Positive

        it('should return 0.5', function() {
            canvas.setShadowOffsetX(0.5);
            expect(canvas.getShadowOffsetX()).toEqual(0.5);
        });

        it('should return -0.5', function() {
            canvas.setShadowOffsetX(-0.5);
            expect(canvas.getShadowOffsetX()).toEqual(-0.5);
        });

        // Negative

        it('should return 0', function() {
            canvas.setShadowOffsetX('');
            expect(canvas.getShadowOffsetX()).toEqual(0);
        });

    });

});
