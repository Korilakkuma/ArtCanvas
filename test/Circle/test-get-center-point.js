describe('Circle TEST', function() {

    describe('Circle.prototype.getCenterPoint', function() {

        it('should return the instance of Point', function() {
            var circle = new Circle(0.25, 0.5, 1);
            var point  = circle.getCenterPoint();

            expect(point).toEqual(jasmine.any(Mocks.ArtCanvas.Point));
            expect(point.getX()).toEqual(0.25);
            expect(point.getY()).toEqual(0.5);
        });

    });

});
