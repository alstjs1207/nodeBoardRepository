var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var config = require('../config/secrets');
var Schema = mongoose.Schema;

var connection = mongoose.createConnection(config.mongodb.local.board);
autoIncrement.initialize(connection);

//게시판 Schema
var boardSchema = new Schema({
	seq : 'number',
	boardcd : 'string',
	title : 'string',
	contents : 'string',
	userid : 'string',
	regdate : 'date',
	moddate : 'date',
	viewcnt : 'number'
});

boardSchema.plugin(autoIncrement.plugin,{
	model : 'boardModel',
	field : 'seq',
	startAt : 1,
	increment : 1
});

var Board = connection.model('boardModel',boardSchema);
module.exports = Board;
