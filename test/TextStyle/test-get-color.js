describe('TextStyle TEST', function() {

    describe('TextStyle.prototype.getColor', function() {

        it('should return "#000000"', function() {
            var font      = new Mocks.ArtCanvas.Font('Helvetica', 'italic', '16px');
            var textStyle = new TextStyle(font, '#000000');

            expect(textStyle.getColor()).toEqual('#000000');
        });

    });

});
