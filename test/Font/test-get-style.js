describe('Font TEST', function() {

    describe('Font.prototype.getStyle', function() {

        it('should return "italic"', function() {
            var font = new Font('Helvetica', '16px', 'italic', 'bold');

            expect(font.getStyle()).toEqual('italic');
        });

    });

});
