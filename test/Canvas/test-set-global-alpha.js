describe('Canvas TEST', function() {

    describe('Canvas.prototype.setGlobalAlpha', function() {

        var canvas = new Canvas(null, null, 300, 300, 1);

        afterEach(function() {
            canvas.setGlobalAlpha(1);
        });

        // Positive

        it('should return 1', function() {
            canvas.setGlobalAlpha(1);
            expect(canvas.getGlobalAlpha()).toEqual(1);
        });

        it('should return 0.5', function() {
            canvas.setGlobalAlpha(0.5);
            expect(canvas.getGlobalAlpha()).toEqual(0.5);
        });

        it('should return 0', function() {
            canvas.setGlobalAlpha(0);
            expect(canvas.getGlobalAlpha()).toEqual(0);
        });

        // Negative

        it('should return 1', function() {
            canvas.setGlobalAlpha(1.1);
            expect(canvas.getGlobalAlpha()).toEqual(1);
        });

        it('should return 1', function() {
            canvas.setGlobalAlpha(-0.1);
            expect(canvas.getGlobalAlpha()).toEqual(1);
        });

    });

});
