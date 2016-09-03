describe('Canvas TEST', function() {

    describe('Canvas.prototype.setStrokeStyle', function() {

        it('should return "#ffffff"', function() {
            var canvas = new Canvas(null, null, 300, 300, 1);

            canvas.setStrokeStyle('#ffffff');

            expect(canvas.getStrokeStyle()).toEqual('#ffffff');
        });

    });

});
