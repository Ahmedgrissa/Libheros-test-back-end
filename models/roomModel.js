var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roomSchema = new Schema({
	'name': String,
	'description': String,
	'capacity': Number,
	'equipements': Array,
	'createdAt': Date,
	'updatedAt': Date,
	'bookings': Array,
});

module.exports = mongoose.model('room', roomSchema);