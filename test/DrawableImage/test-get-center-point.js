describe('DrawableImage TEST', function() {

    describe('DrawableImage.prototype.getCenterPoint', function() {

        it('should return the instance of Point', function() {
            var image = new DrawableImage('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw%3D%3D', function() {});
            var point = image.getCenterPoint();

            expect(point).toEqual(jasmine.any(Mocks.ArtCanvas.Point));
            expect(point.getX()).toEqual(0.5);
            expect(point.getY()).toEqual(0.5);
        });

    });

});
