describe('Canvas TEST', function() {

    describe('Canvas.prototype.getShadowOffsetX', function() {

        it('should return 0', function() {
            var canvas = new Canvas(null, null, 300, 300, 1);

            expect(canvas.getShadowOffsetX()).toEqual(0);
        });

    });

});
