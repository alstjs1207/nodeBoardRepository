var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var fs = require('fs');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var config = require('../config/secrets'); //config 파일 설정
var passport = require('passport'); //passport 추가
var NaverStrategy = require('passport-naver').Strategy;

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
				
				//session 설정 현재는 sid에 id정보를 넣고있음
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
router.get('/logout', function(req, res, next) {
	console.log("logout");
	req.session.destroy();
	req.logout();
//	res.redirect('/main/login');
	res.redirect('/board/list/1');
	
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

/* naver 로그인 연동
 * 
 */
router.get('/naver',passport.authenticate('naver',null),function(req, res) {
	console.log("/main/naver");
});

//처리 후 callback 처리 부분 성공/실패 시 리다이렉트 설정
router.get('/naver/callback', passport.authenticate('naver', {
    successRedirect: '/',
    failureRedirect: '/main/login'
  })
 );

passport.use(new NaverStrategy({
    clientID: config.authLogin.naver.client_id,
    clientSecret: config.authLogin.naver.secret_id,
    callbackURL: config.authLogin.naver.callback_url
}, 
function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {

        var user = {
            name: profile.displayName,
            email: profile.emails[0].value,
            username: profile.displayName,
            provider: 'naver',
            naver: profile._json
        };
        console.log("user=");
        console.log(user);
    	
        return done(null, user);
    	});
	}
));


//failed to serialize user into session 에러 발생 시 아래의 내용을 추가 한다.
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(req, user, done) {
	
	// passport로 로그인 처리 후 해당 정보를 session에 담는다.
	req.session.sid = user.name;
	console.log("Session Check :" +req.session.sid);
    done(null, user);
});


var pool = mysql.createPool({
	connectionLimit: 10,
	host:config.mysql_db.aws.host,
	user: config.mysql_db.aws.user,
	password: config.mysql_db.aws.password,
	database: config.mysql_db.aws.database,
  	dateStrings: 'date' //db의 datetime을 정리된 데이터로 추출
});

function getConnection(){
	return pool;
}

module.exports = router;



