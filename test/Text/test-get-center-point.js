describe('Text TEST', function() {

    describe('Text.prototype.getCenterPoint', function() {

        var canvas  = document.createElement('canvas');
        var context = canvas.getContext('2d');

        var font = new Mocks.ArtCanvas.Font('Helvetica', 'italic', '16px');

        it('should return the instance of Point', function() {
            var text  = new Text('', new Mocks.ArtCanvas.Point(1, 2), new Mocks.ArtCanvas.TextStyle(font, '#000000'));
            var point = text.getCenterPoint(context);

            expect(point).toEqual(jasmine.any(Mocks.ArtCanvas.Point));
            expect(point.getX()).toEqual(1);
            expect(point.getY()).toEqual(10);
        });

        it('should return the instance of Point', function() {
            var text  = new Text('test', new Mocks.ArtCanvas.Point(1, 2), new Mocks.ArtCanvas.TextStyle(font, '#000000'));
            var point = text.getCenterPoint(context);

            expect(point).toEqual(jasmine.any(Mocks.ArtCanvas.Point));
            expect(Math.floor(point.getX())).toEqual(10);
            expect(Math.floor(point.getY())).toEqual(10);
        });

    });

});
