var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var config = require('../config/secrets');
var Schema = mongoose.Schema;

var connection = mongoose.createConnection(config.mongodb.local.board);

//사용자 Schema
var userSchema = new Schema({
	userid : 'string',
	password : 'string',
	nickname : 'string'
});

var User = connection.model('userModel',userSchema);
module.exports = User;
