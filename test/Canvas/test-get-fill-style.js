describe('Canvas TEST', function() {

    describe('Canvas.prototype.getFillStyle', function() {

        it('should return "#000000"', function() {
            var canvas = new Canvas(null, null, 300, 300, 1);

            expect(canvas.getFillStyle()).toEqual('#000000');
        });

    });

});
