describe('Canvas TEST', function() {

    describe('Canvas.prototype.setLineWidth', function() {

        var canvas = new Canvas(null, null, 300, 300, 1);

        afterEach(function() {
            canvas.setLineWidth(1);
        });

        // Positive

        it('should return 0.25', function() {
            canvas.setLineWidth(0.25);
            expect(canvas.getLineWidth()).toEqual(0.25);
        });

        // Negative

        it('should return 1', function() {
            canvas.setLineWidth(0);
            expect(canvas.getLineWidth()).toEqual(1);
        });

    });

});
