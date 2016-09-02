describe('Filter TEST', function() {

    describe('Filter.prototype.getAmounts', function() {

        // Positive

        it('should return [100, 200, 3000]', function() {
            var filter = new Filter(Filter.NONE, [100, 200, 3000]);

            expect(filter.getAmounts()).toEqual([100, 200, 3000]);
        });

        // Negative

        it('should return []', function() {
            var filter = new Filter(Filter.NONE, null);

            expect(filter.getAmounts()).toEqual([]);
        });

    });

});
