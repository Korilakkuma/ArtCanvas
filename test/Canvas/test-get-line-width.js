describe('Canvas TEST', function() {

    describe('Canvas.prototype.getLineWidth', function() {

        it('should return 1', function() {
            var canvas = new Canvas(null, null, 300, 300, 1);

            expect(canvas.getLineWidth()).toEqual(1);
        });

    });

});
