describe('Text TEST', function() {

    describe('Text.prototype.getText', function() {

        var point     = Mocks.ArtCanvas.Point(0, 0);
        var textStyle = Mocks.ArtCanvas.TextStyle();

        // Positive

        it('should return "test"', function() {
            var text = new Text('test', point, textStyle);
            expect(text.getText()).toEqual('test');
        });

        // Negative

        it('should return "null"', function() {
            var text = new Text(null, point, textStyle);
            expect(text.getText()).toEqual('null');
        });

        it('should return "undefined"', function() {
            var text = new Text(undefined, point, textStyle);
            expect(text.getText()).toEqual('undefined');
        });

        it('should return ""', function() {
            var text = new Text([], point, textStyle);
            expect(text.getText()).toEqual('');
        });

        it('should return "[object JSON]"', function() {
            var text = new Text(JSON, point, textStyle);
            expect(text.getText()).toEqual('[object JSON]');
        });

    });

});
