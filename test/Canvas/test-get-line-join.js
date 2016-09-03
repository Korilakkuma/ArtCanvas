describe('Canvas TEST', function() {

    describe('Canvas.prototype.getLineJoin', function() {

        it('should return "miter"', function() {
            var canvas = new Canvas(null, null, 300, 300, 1);

            expect(canvas.getLineJoin()).toEqual('miter');
        });

    });

});
