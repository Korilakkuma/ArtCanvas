describe('Canvas TEST', function() {

    describe('Canvas.prototype.setLineCap', function() {

        var canvas = new Canvas(null, null, 300, 300, 1);

        afterEach(function() {
            canvas.setLineCap('butt');
        });

        // Positive

        it('should return "butt"', function() {
            canvas.setLineCap('butt');
            expect(canvas.getLineCap()).toEqual('butt');
        });

        it('should return "round"', function() {
            canvas.setLineCap('round');
            expect(canvas.getLineCap()).toEqual('round');
        });

        it('should return "square"', function() {
            canvas.setLineCap('square');
            expect(canvas.getLineCap()).toEqual('square');
        });

        // Negative

        it('should return "butt"', function() {
            canvas.setLineCap('');
            expect(canvas.getLineCap()).toEqual('butt');
        });

    });

});
