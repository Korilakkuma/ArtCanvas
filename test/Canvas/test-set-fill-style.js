describe('Canvas TEST', function() {

    describe('Canvas.prototype.setFillStyle', function() {

        it('should return "#ffffff"', function() {
            var canvas = new Canvas(null, null, 300, 300, 1);

            canvas.setFillStyle('#ffffff');

            expect(canvas.getFillStyle()).toEqual('#ffffff');
        });

    });

});
