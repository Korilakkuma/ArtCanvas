describe('Rectangle TEST', function() {

    describe('Rectangle.prototype.getRightBottom', function() {

        it('should return {right : 1.5, bottom : 2}', function() {
            var rectangle = new Rectangle(0.25, 0.5, 1.25, 1.5);

            expect(rectangle.getRightBottom()).toEqual({right : 1.5, bottom : 2});
        });

    });

});
