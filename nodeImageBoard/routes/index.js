var express = require('express');
var router = express.Router();
var crypto = require('crypto');

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
//	res.redirect('/main/login');
	res.redirect('/board/list/1');
});

module.exports = router;
