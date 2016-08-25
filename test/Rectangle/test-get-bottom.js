describe('Rectangle TEST', function() {

    describe('Rectangle.prototype.getBottom', function() {

        it('should return 0.75', function() {
            var rectangle = new Rectangle(1, 0.25, 1, 0.5);

            expect(rectangle.getBottom()).toEqual(0.75);
        });

    });

});
