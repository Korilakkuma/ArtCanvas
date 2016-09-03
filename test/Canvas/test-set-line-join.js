describe('Canvas TEST', function() {

    describe('Canvas.prototype.setLineJoin', function() {

        var canvas = new Canvas(null, null, 300, 300, 1);

        afterEach(function() {
            canvas.setLineJoin('miter');
        });

        // Positive

        it('should return "miter"', function() {
            canvas.setLineJoin('miter');
            expect(canvas.getLineJoin()).toEqual('miter');
        });

        it('should return "round"', function() {
            canvas.setLineJoin('round');
            expect(canvas.getLineJoin()).toEqual('round');
        });

        it('should return "bevel"', function() {
            canvas.setLineJoin('bevel');
            expect(canvas.getLineJoin()).toEqual('bevel');
        });

        // Negative

        it('should return "miter"', function() {
            canvas.setLineJoin('');
            expect(canvas.getLineJoin()).toEqual('miter');
        });

    });

});
