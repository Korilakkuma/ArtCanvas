describe('Canvas TEST', function() {

    describe('Canvas.prototype.getGlobalAlpha', function() {

        it('should return 1', function() {
            var canvas = new Canvas(null, null, 300, 300, 1);

            expect(canvas.getGlobalAlpha()).toEqual(1);
        });

    });

});
