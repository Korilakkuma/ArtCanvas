describe('Canvas TEST', function() {

    describe('Canvas.prototype.getStrokeStyle', function() {

        it('should return "#000000"', function() {
            var canvas = new Canvas(null, null, 300, 300, 1);

            expect(canvas.getStrokeStyle()).toEqual('#000000');
        });

    });

});
