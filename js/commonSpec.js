describe("Unit testing common.js", function () {
	describe('Verify that the function verifyLang properly handle the language', function () {
        var defaultLanguage = 'en';
        it('Shold return the default languge if the input is undef', function () {
            expect(LucaTest.verifyLang(undefined)).toEqual(defaultLanguage);
        });
        it('Shold return the default languge if the input is a number', function () {
            expect(LucaTest.verifyLang(32)).toEqual(defaultLanguage);
        });
        it('Shold return the default languge if the input is a wrong language', function () {
            expect(LucaTest.verifyLang('xxx')).toEqual(defaultLanguage);
        });
        it('Shold return the language if the input is a correct language', function () {
            expect(LucaTest.verifyLang('it')).toEqual('it');
        });
    });
    describe("Testing the getCityDetails functionality", function () {
        var url = LucaTest.config().geobytesUrls.getCityDetails;
        beforeEach(function (done) {
            LucaTest.getCityLatLng("Madrid, MD, Spain", url, function (lat, lng) {
                value = lat + "," + lng;
                // console.log(value);
                done();
            });
        });
        it("Madrid in Spain should have coordinate 40.400002,-3.683000", function(done) {
            expect(value).toEqual('40.400002,-3.683000');
            done();
        });
    });
});
describe("Testing the Geobytes' APIs", function () {
	describe("Testing the AutoCompleteCity API", function () {
		var returnedJSON = {};
		beforeEach(function (done) {
			$.getJSON("http://gd.geobytes.com/AutoCompleteCity?callback=?&filter=de&q=ber")
			.done(function (result) {
				returnedJSON = result;
				done();
			});
		});
		it("Should have returned JSON if the async call has completed", function () {
			expect(returnedJSON).not.toEqual({});
			expect(returnedJSON).not.toBeUndefined();
		});
	});
	describe("Testing the GetCityDetails API", function () {
		var returnedJSON = {};
		beforeEach(function (done) {
			$.getJSON("http://gd.geobytes.com/GetCityDetails?callback=?&fqcn=berlin,%20BE,%20Germany")
			.done(function (result) {
                returnedJSON = result;
                done();
			});
		});
		it("Should have returned JSON if the async call has completed", function () {
			expect(returnedJSON).not.toEqual({});
			expect(returnedJSON).not.toBeUndefined();
		});
	});
});
