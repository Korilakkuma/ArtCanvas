describe('Canvas TEST', function() {

    describe('Canvas.prototype.setShadowColor', function() {

        it('should return "rgba(0, 0, 0, 0.2)"', function() {
            var canvas = new Canvas(null, null, 300, 300, 1);

            canvas.setShadowColor('rgba(0, 0, 0, 0.2)');

            expect(canvas.getShadowColor()).toEqual('rgba(0, 0, 0, 0.2)');
        });

    });

});
