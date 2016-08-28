describe('Text TEST', function() {

    describe('Text.prototype.getTextStyle', function() {

        // Positive

        it('should return the instance of TextStyle', function() {
            var text = new Text('test', new Mocks.ArtCanvas.Point(1, 1), new Mocks.ArtCanvas.TextStyle());
            expect(text.getTextStyle()).toEqual(jasmine.any(Mocks.ArtCanvas.TextStyle));
        });

        // Negative

        it('should return null', function() {
            var text = new Text('test', new Mocks.ArtCanvas.Point(1, 1), '');
            expect(text.getTextStyle()).toBeNull();
        });

    });

});
