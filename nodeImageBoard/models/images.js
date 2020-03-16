var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var config = require('../config/secrets');
var Schema = mongoose.Schema;

var connection = mongoose.createConnection(config.mongodb.local.board);
autoIncrement.initialize(connection);

//이미지 Schema
var imageSchema = new Schema({
	seq : 'number',
	boardcd : 'string',
	filename : 'string',
	filedir : 'string',
	vfiledir : 'string',
	regdate : 'date',
	moddate : 'date',
	repyn : 'string'
});

imageSchema.plugin(autoIncrement.plugin,{
	model : 'imageModel',
	field : 'seq',
	startAt : 1,
	increment : 1
});

var Image = connection.model('imageModel',imageSchema);
module.exports = Image;
