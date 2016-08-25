describe('Rectangle TEST', function() {

    describe('Rectangle.prototype.getSize', function() {

        it('should return {width : 0.25, height : 0.5}', function() {
            var rectangle = new Rectangle(1, 1, 0.25, 0.5);

            expect(rectangle.getSize()).toEqual({width : 0.25, height : 0.5});
        });

    });

});
