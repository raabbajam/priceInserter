var expect = require('chai').expect;
describe('Price Inserter', function () {
	it('should return a function', function (done) {
		var priceInserter = require('../index.js')('citilink');
		var x = priceInserter({ori:'a', dst:'b', ftid: '2', class: 'x', rute:'ow'}, 99);
		expect(x).to.eq.function;
		done();
	});
});