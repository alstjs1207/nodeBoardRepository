var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var fs = require('fs');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var crypto = require('crypto');

/* POST listing. */
router.post('/login', function(req, res, next) {
	console.log("login");
	
	var id = req.body.userid;
	var pwd = req.body.password;
	
	console.log(id+","+pwd);
	
	console.log("se login  :"+ req.session.sid);
	
	//패스워드 sha256
	var enPwd = crypto.createHash('sha256').update(pwd).digest('hex');
	
	enPwd = enPwd.toUpperCase();
	
	console.log(enPwd);
	
	//사용자 조회
	var userQuery="SELECT userid, password, nickname FROM USER WHERE userid = ?";
	
	getConnection().query(userQuery,[id], function(err, user){
		if(err) {
			console.log(err + "쿼리 에러");
			return;
		}
		
		if(user.length !== 0){
			var userPwd = user[0].password;
			console.log("userPwd : "+userPwd);
			
			if(userPwd === enPwd){ //===은 데이터 타입까지 일치 확인
				console.log("사용자 정보 일치");
				
				//session 설정
				req.session.sid = id;
				req.session.createTime = new Date();
				console.log("session insert : " + req.session.sid);
				res.redirect('/board/list/'+1);
			}
			else {
				console.log("사용자 정보 불 일치");
				res.redirect('/main/login');
				return;
			}
			
		}
		else {
			console.log("사용자 정보 없음");
			//return res.send('<script type="text/javascript"> alert("계정이나 비밀번호가 다릅니다.");</script>');
			res.redirect('/main/login');
		}
		
	});
});

//로그아웃
router.post('/logout', function(req, res, next) {
	console.log("logout");
	req.session.destroy();
	res.redirect('/main/login');
	
});

router.get('/login', function(req, res, next) {
	
	console.log("login start page : "+req.session.sid);
	
	if(req.session.sid){
		
		res.redirect('/board/list/'+1);
	}else {
		res.render('main/login',{
			session:req.session
		});
	}
});

router.get('/join', function(req, res, next) {
		console.log("join page");
		res.render('main/join');
});

router.post('/reg', function(req, res, next) {
	console.log("join reg");
	
	var id = req.body.userid;
	var pwd = req.body.password;
	var nickNm = req.body.nickname;
	
	var enPwd = crypto.createHash('sha256').update(pwd).digest('hex');
	pwd = enPwd.toUpperCase();
	
	var regQuery = "INSERT INTO USER (userid, password,	nickname, regdate, moddate) VALUES (?,?,?, SYSDATE(), SYSDATE())";
	
	getConnection().query(regQuery,[id,pwd,nickNm], function(err, user){
		if(err) {
			console.log(err + "쿼리 에러");
			return;
		}
		
		console.log("등록 성공");
		
		res.redirect('/main/login');
	});
});

var pool = mysql.createPool({
	connectionLimit: 10,
	host:"192.168.0.98",
  	user: "root",
  	password: "root",
  	database: "BOARD",
  	dateStrings: 'date' //db의 datetime을 정리된 데이터로 추출
});

function getConnection(){
	return pool;
};

module.exports = router;



