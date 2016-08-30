describe('Font TEST', function() {

    describe('Font.prototype.getWeight', function() {

        it('should return "italic"', function() {
            var font = new Font('Helvetica', '16px', 'italic', 'bold');

            expect(font.getWeight()).toEqual('bold');
        });

    });

});
