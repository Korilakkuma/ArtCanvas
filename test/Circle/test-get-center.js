describe('Circle TEST', function() {

    describe('Circle.prototype.getCenter', function() {

        it('should return {x : 0.25, y : 0.5}', function() {
            var circle = new Circle(0.25, 0.5, 1);

            expect(circle.getCenter()).toEqual({x : 0.25, y : 0.5});
        });

    });

});
