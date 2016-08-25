describe('Rectangle TEST', function() {

    describe('Rectangle.prototype.getLeftTop', function() {

        it('should return {left : 0.25, top : 0.5}', function() {
            var rectangle = new Rectangle(0.25, 0.5, 1, 1);

            expect(rectangle.getLeftTop()).toEqual({left : 0.25, top : 0.5});
        });

    });

});
