describe('Canvas TEST', function() {

    describe('Canvas.prototype.getLineCap', function() {

        it('should return "butt"', function() {
            var canvas = new Canvas(null, null, 300, 300, 1);

            expect(canvas.getLineCap()).toEqual('butt');
        });

    });

});
