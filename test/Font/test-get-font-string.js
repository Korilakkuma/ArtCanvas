describe('Font TEST', function() {

    describe('Font.prototype.getFontString', function() {

        it('should return "italic 16px "Helvetica""', function() {
            var font = new Font('Helvetica', '16px', 'italic', 'bold');

            expect(font.getFontString()).toEqual('italic bold 16px "Helvetica"');
        });

    });

});
