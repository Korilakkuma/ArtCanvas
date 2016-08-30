describe('Font TEST', function() {

    describe('Font.prototype.getFamily', function() {

        it('should return "Helvetica"', function() {
            var font = new Font('Helvetica', '16px', 'italic', 'bold');

            expect(font.getFamily()).toEqual('Helvetica');
        });

    });

});
