describe('Rectangle TEST', function() {

    describe('Rectangle.prototype.getCenterPoint', function() {

        it('should return the instance of Point', function() {
            var rectangle = new Rectangle(1.25, 1.5, 0.25, 0.5);
            var point     = rectangle.getCenterPoint();

            expect(point).toEqual(jasmine.any(Mocks.ArtCanvas.Point));
            expect(point.getX()).toEqual(1.375);
            expect(point.getY()).toEqual(1.75);
        });

    });

});
