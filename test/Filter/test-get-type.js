describe('Filter TEST', function() {

    describe('Filter.prototype.getType', function() {

        // Negative

        it('should return "none"', function() {
            var filter = new Filter('', []);

            expect(filter.getType()).toEqual('none');
        });

        // Positive

        it('should return "none"', function() {
            var filter = new Filter(Filter.NONE, []);

            expect(filter.getType()).toEqual('none');
        });

        it('should return "redemphasis"', function() {
            var filter = new Filter(Filter.REDEMPHASIS, []);

            expect(filter.getType()).toEqual('redemphasis');
        });

        it('should return "grayscale"', function() {
            var filter = new Filter(Filter.GRAYSCALE, []);

            expect(filter.getType()).toEqual('grayscale');
        });

        it('should return "reverse"', function() {
            var filter = new Filter(Filter.REVERSE, []);

            expect(filter.getType()).toEqual('reverse');
        });

        it('should return "noise"', function() {
            var filter = new Filter(Filter.NOISE, []);

            expect(filter.getType()).toEqual('noise');
        });

        it('should return "blur"', function() {
            var filter = new Filter(Filter.BLUR, []);

            expect(filter.getType()).toEqual('blur');
        });

    });

});
