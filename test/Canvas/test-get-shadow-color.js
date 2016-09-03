describe('Canvas TEST', function() {

    describe('Canvas.prototype.getShadowColor', function() {

        it('should return "rgba(0, 0, 0, 0)"', function() {
            var canvas = new Canvas(null, null, 300, 300, 1);

            expect(canvas.getShadowColor()).toEqual('rgba(0, 0, 0, 0)');
        });

    });

});
