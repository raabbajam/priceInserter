var expect = require('chai').expect;
describe('Price Inserter', function () {
	it('should return a function', function (next) {
		var priceInserter = require('../index.js')('citilink');
		priceInserter({ori:'a', dst:'b', ftid: '2', class: 'x'}, 99);
	});
});