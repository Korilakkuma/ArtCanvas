describe('Canvas TEST', function() {

    describe('Canvas.prototype.getCanvas', function() {

        it('should return the instance of HTMLCanvasElement', function() {
            var canvas1 = new Canvas(null, null, 300, 300, 1);
            var canvas2 = new Canvas(null, document.createElement('canvas'), 300, 300, 1);

            expect(canvas1.getCanvas()).toEqual(jasmine.any(HTMLCanvasElement));
            expect(canvas2.getCanvas()).toEqual(jasmine.any(HTMLCanvasElement));
        });

    });

});
