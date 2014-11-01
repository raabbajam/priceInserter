var ElasticSearchClient = require('elasticsearchclient');
var db = new ElasticSearchClient({
    host: 'localhost',
    port: '9200'
});
var airlines = {"airasia": 1, "citilink": 2, "garuda": 3, "lion": 4, "sriwijaya": 5, "xpress": 6};
function priceInserter (airline) {
	var _kode = airlines[airline] || 0;
	var _airline = airline;
	return function (dt, price) {
		var _price = parseInt(price, 10) + _kode;
		var data = {
			origin: dt.ori,
			destination: dt.dst,
			airline: _airline,
			flight: dt.ftid,
			class: dt.class,
			price: _price
		};
		data.id = data.origin + data.destination + data.airline + data.flight + data.class;
		db.index('pluto', 'price', data, function (err, data) {
			// do nothing
		});
	}
}
module.exports = priceInserter;