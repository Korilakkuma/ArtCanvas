describe('TextStyle TEST', function() {

    describe('TextStyle.prototype.getFont', function() {

        it('should return the instance of Font', function() {
            var font      = new Mocks.ArtCanvas.Font('Helvetica', 'italic', '16px');
            var textStyle = new TextStyle(font, '#000000');

            expect(textStyle.getFont()).toEqual(jasmine.any(Mocks.ArtCanvas.Font));
        });

        it('should return null', function() {
            var textStyle = new TextStyle('', '#000000');

            expect(textStyle.getFont()).toBeNull();
        });

    });

});
