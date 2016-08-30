describe('Font TEST', function() {

    describe('Font.prototype.getSize', function() {

        it('should return "16px"', function() {
            var font = new Font('Helvetica', '16px', 'italic', 'bold');

            expect(font.getSize()).toEqual('16px');
        });

    });

});
