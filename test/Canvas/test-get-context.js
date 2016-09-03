describe('Canvas TEST', function() {

    describe('Canvas.prototype.getContext', function() {

        it('should return the instance of CanvasRenderingContext2D', function() {
            var canvas1 = new Canvas(null, null, 300, 300, 1);
            var canvas2 = new Canvas(null, document.createElement('canvas'), 300, 300, 1);

            expect(canvas1.getContext()).toEqual(jasmine.any(CanvasRenderingContext2D));
            expect(canvas2.getContext()).toEqual(jasmine.any(CanvasRenderingContext2D));
        });

    });

});
