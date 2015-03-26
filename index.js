var ElasticSearchClient = require('elasticsearchclient');
var db                  = new ElasticSearchClient({
    host: 'localhost',
    port: '9200'
});
var debug       = require('debug')('raabbajam:priceInserter:base');
var moment      = require('moment');
var dateFormats = ['DD+MM+YYYY', 'DD+MMM+YYYY', 'DD MM YYYY', 'DD MMM YYYY'];
var moment      = require('moment');
var airlines    = {"airasia": 1, "citilink": 2, "garuda": 3, "lion": 4, "sriwijaya": 5, "xpress": 6, "kalstar": 7};
var debug       = require('debug')('raabbajam:priceInserter:base');
function priceInserter (airline) {
	_kode    = airlines[airline] || 0;
	_airline = airline;
	return function (dt, price) {
		debug('running priceInserter')
		if(!!dt.rute && (dt.rute.toLowerCase() === 'rt' || dt.rute.toLowerCase() !== 'ow')){
			debug('Return route. Not cached!');
			return true;
		}
		debug('start inserting')
		insertCache(dt, price);
		insertCalendar(dt, price);
	}
}
function insertCache (dt, price) {
	debug('running insertCache')
	var _price = parseInt(price, 10) + _kode;
	var _price = price;
	var data = {
		price      : _price,
		class      : dt.class || '',
		flight     : dt.ftid || '',
		origin     : dt.ori,
		airline    : _airline,
		destination: dt.dst,
	};
	data.id = data.origin + data.destination + data.airline + data.flight + data.class;
	db.index('pluto', 'price', data, function (err, res) {
		if (err){
			debug('error insert cache', err);
			return false;
		}
		debug('insert cache', data, res)
	});
}
function insertCalendar (dt, price) {
	debug('running insertCalendar')
	var _price = parseInt(price, 10) + _kode;
	var _price = price;
	var _date  = moment(dt.dep_date, dateFormats).unix() * 1000;
	var data   = {
		date       : _date,
		price      : _price,
		origin     : dt.ori,
		airline    : _airline,
		destination: dt.dst,
	};
	data.id = data.origin + data.destination + Math.round(data.date/1000);
    data.id = data.id.toLowerCase();

	getByDate(data.id, function (res) {
		var oldPrice = 0
		if(res.found){
			oldPrice = res._source && res._source.price || 0;
			debug('found oldPrice', oldPrice)
		}

		if ( oldPrice !== 0 && _price > oldPrice ){
			debug('not saved, not fit. oldPrice:', oldPrice, '. _price:', _price)
			return false;
		}

		data.price = _price;
		db.index('pluto', 'calendar', data, function (err, res) {
			if (err){
				debug('error insert calendar', err);
				return false;
			}
			debug('insert calendar', data, res)
		});
	});
}
function getByDate (_id, cb) {
	db.get('pluto', 'calendar', _id, function (err, res) {
		if (err){
			debug('error getByDate', err);
			return false;
		}
		cb(JSON.parse(res));
	});
}
module.exports = priceInserter;
