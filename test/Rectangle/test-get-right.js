describe('Rectangle TEST', function() {

    describe('Rectangle.prototype.getRight', function() {

        it('should return 0.75', function() {
            var rectangle = new Rectangle(0.25, 1, 0.5, 1);

            expect(rectangle.getRight()).toEqual(0.75);
        });

    });

});
