var ElasticSearchClient = require('elasticsearchclient');
var db = new ElasticSearchClient({
    host: 'localhost',
    port: '9200'
});
var dateFormats = ['DD+MM+YYYY', 'DD+MMM+YYYY', 'DD MM YYYY', 'DD MMM YYYY'];
var moment = require('moment');
var airlines = {"airasia": 1, "citilink": 2, "garuda": 3, "lion": 4, "sriwijaya": 5, "xpress": 6};
function priceInserter (airline) {
	var _kode = airlines[airline] || 0;
	var _airline = airline;
	return function (dt, price) {
		insertCache(dt, price);
		insertCalendar(dt, price);
	}
}
function insertCache (dt, price) {
	var _price = parseInt(price, 10) + _kode;
	var data = {
		origin: dt.ori,
		destination: dt.dst,
		airline: _airline,
		flight: dt.ftid || '',
		class: dt.class || '',
		price: _price
	};
	data.id = data.origin + data.destination + data.airline + data.flight + data.class;
	db.index('pluto', 'price', data, function (err, data) {
		// do nothing
	});
}
function insertCalendar (dt, price) {
	var _price = parseInt(price, 10) + _kode;
	var _date = moment(dt.dep_date, dateFormats).unix() * 1000;
	var data = {
		date: _date,
		origin: dt.ori,
		destination: dt.dst,
		price: _price
		airline: _airline,
	};
	data.id = data.origin + data.destination + Math.round(data.date/1000);

	getByDate(data, function (res) {
		var oldPrice = res.data;
		if ( oldPrice !== 0 && price > oldPrice )
			return false;
		body.price = price;
		db.index('pluto', 'calendar', data, function (err, data) {
			console.log('insert2');
		});
	});		
}
function getByDate (dt, cb) {
	var date = moment(dt.date, dateFormats).unix();
	var _id = dt.origin + dt.destination + date;
	db.get('pluto', 'calendar', _id, function (res) {
		cb(res);
	});
}
module.exports = priceInserter;