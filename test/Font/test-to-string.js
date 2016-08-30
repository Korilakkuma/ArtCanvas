describe('Font TEST', function() {

    describe('Font.prototype.toString', function() {

        it('should return "italic 16px "Helvetica""', function() {
            var font = new Font('Helvetica', '16px', 'italic', 'bold');

            expect(font.toString()).toEqual('italic bold 16px "Helvetica"');
        });

    });

});
