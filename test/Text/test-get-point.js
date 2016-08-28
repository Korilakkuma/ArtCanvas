describe('Text TEST', function() {

    describe('Text.prototype.getPoint', function() {

        // Positive

        it('should return the instance of Point', function() {
            var text  = new Text('test', new Mocks.ArtCanvas.Point(1, 1), new Mocks.ArtCanvas.TextStyle());
            var point = text.getPoint();

            expect(point).toEqual(jasmine.any(Mocks.ArtCanvas.Point));
            expect(point.getX()).toEqual(1);
            expect(point.getY()).toEqual(1);
        });

        // Negative

        it('should return the instance of Point', function() {
            var text  = new Text('test', null, new Mocks.ArtCanvas.TextStyle());
            var point = text.getPoint();

            expect(point).toEqual(jasmine.any(Mocks.ArtCanvas.Point));
            expect(point.getX()).toEqual(0);
            expect(point.getY()).toEqual(0);
        });

    });

});
