/* Lott's Album Board
 * version 1.0 - mysql
 * 
 * 2019.10.16
 * version 1.5 - mongoDB
 * 
 */
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var fs = require('fs');
var ejs = require('ejs');
var moment = require('moment');
var multer = require('multer');
//파일이름이 암호화 되는것을 방지 하지 위해
var upload = multer({
	storage: multer.diskStorage({
		destination: function (req, file, cb){
			cb(null, 'public/image/');
		},
		filename: function(req, file, cb) {
			cb(null, file.originalname);
		}
	})});

var async = require('async');
var config = require('../config/secrets');

var mongoose = require('mongoose');
//mongoose-auto-increment
var autoIncrement = require('mongoose-auto-increment');

// auto-increment를 사용하기위해 해당 정보 주석 처리
/*mongoose.connect('mongodb://localhost:27017/board');
var db = mongoose.connection;
db.on('error',function(){
	console.log('connection failed!!');
});

db.once('open',function(){
	console.log('connect!!!');
});*/

var connection = mongoose.createConnection(config.mongodb.local.board);

autoIncrement.initialize(connection);

//게시판 Schema
var board = new mongoose.Schema({
	seq : 'number',
	boardcd : 'string',
	title : 'string',
	contents : 'string',
	userid : 'string',
	regdate : 'date',
	moddate : 'date',
	viewcnt : 'number'
});

//이미지 Schema
var image = new mongoose.Schema({
	seq : 'number',
	boardcd : 'string',
	filename : 'string',
	filedir : 'string',
	vfiledir : 'string',
	regdate : 'date',
	moddate : 'date',
	repyn : 'string'
});

board.plugin(autoIncrement.plugin,{
	model : 'boardModel',
	field : 'seq',
	startAt : 1,
	increment : 1
});

image.plugin(autoIncrement.plugin,{
	model : 'imageModel',
	field : 'seq',
	startAt : 1,
	increment : 1
});

var Board = connection.model('boardModel',board);

var Image = connection.model('imageModel',image);

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.redirect('/board/list/'+1);
});

// 게시판 목록
router.get('/list/:cur', function(req, res, next) {
	console.log("board list!!");
	console.log("session sid :  "+req.session.sid);
	
	var startPage = 0;
	var endPage = 15;
	var totalPage = 0;
	
	// SELECT count(*) as count FROM BOARD
	Board.count({},function(err, count){
		if(err) {
				console.log(err + "페이징 에러");
				return;
			}
			
			//전체 게시판 개수
			totalPage = count;
			
			var startPage = req.params.cur;
			
			if(startPage == 1){
				startPage = 0;
			}
			else {
				startPage = (startPage - 1) * 15;
			}
			
			console.log("현재 페이지 : "+ startPage +", 전체 게시판 개수 :"+totalPage);
			
			var pagform = {
					"startPage" : startPage,
					"totalPage" : totalPage,
					"endPage" : endPage
			};
			// SELECT * FROM BOARD ORDER BY moddate DESC limit startPage,15
			// moddate로 내림차순 정렬, startPage부터 15개의 게시판 정보 가져오기
			Board.aggregate([{$project: {seq:1,boardcd:1,title:1,contents:1,userid:1,viewcnt:1,year:{$year: "$moddate"},month:{$month:"$moddate"},day:{$dayOfMonth:"$moddate"}}},{$sort:{moddate:-1}},{$skip:0},{$limit:15}]).exec(function(err, boardList){
//			Board.find({}).sort({'moddate':-1}).skip(startPage).limit(15).exec(function(err, boardList){
		  		if(err) {
		  			console.log("error :"+err);
		  			return;
		  		}
		  		//SELECT * FROM IMAGE WHERE repyn = 'Y'
		  		Image.find({ repyn: 'Y'}).exec(function(err, repImageList){
			  		if(err) {
			  			console.log("error :"+err);
			  			return;
			  		}
			  		
			  		res.render('board/list',{boardList:boardList, repImageList:repImageList, pagform:pagform,session:req.session});
		  		});
		  	});
		});
});


/* 기존 mysql를 이용한 게시판 조회
router.get('/list/:cur', function(req, res, next) {
	console.log("board list!!");
	console.log("session sid :  "+req.session.sid);
	
	var startPage = 0;
	var endPage = 6;
	var totalPage = 0;
	
		var countQuery = "SELECT count(*) as cnt FROM BOARD";
		
		getConnection().query(countQuery, function(err, count){
			if(err) {
				console.log(err + "페이징 에러");
				return;
			}
			
			//전체 게시판 개수
			totalPage = count[0].cnt;
			
			var startPage = req.params.cur;
			
			if(startPage == 1){
				startPage = 0;
			}
			else {
				startPage = (startPage - 1) * 15;
			}
			
			console.log("현재 페이지 : "+ startPage +", 전체 게시판 개수 :"+totalPage);
			
			var pagform = {
					"startPage" : startPage,
					"totalPage" : totalPage,
					"endPage" : endPage
			};
			
			var listQuery = "SELECT seq, boardcd, title, contents,userid, regdate, datediff(now(),moddate) as moddate, viewcnt FROM BOARD ORDER BY moddate ASC limit ?,15";
			var reqImgQuery = "SELECT seq,	boardcd, filename, filedir,	vfiledir, regdate, moddate, repyn FROM IMAGE WHERE repyn = 'Y'";
			
			getConnection().query(listQuery,[startPage], function(err, boardList, fields){
		  		if(err) {
		  			console.log("error :"+err);
		  			return;
		  		}
		  		
		  		//console.log("date : "+moment(boardList[0].moddate).fromNow());
		  		getConnection().query(reqImgQuery, function(err, repImageList, fields){
			  		if(err) {
			  			console.log("error :"+err);
			  			return;
			  		}
			  		
			  		res.render('board/list',{boardList:boardList, repImageList:repImageList, pagform:pagform,session:req.session});
		  		});
		  	});
		});
});*/
//등록 첫 화면
router.get('/reg', function(req, res, next) {
	console.log("board reg!!");
	console.log("board reg:  "+req.session.sid);
	res.render('board/reg',{title:'이미지 게시판',session:req.session});
});

// upload.array : 이미지 파일 업로드를 여러개 등록한 경우
// 이미지 등록
router.post('/reg',upload.array('filename'), function(req, res, next) {
	console.log("board save!!");
	
	var body = req.body;
	
	var boardQuery = "INSERT INTO BOARD (boardcd, title, contents, userid, regdate, moddate) VALUE (?,?,?,?,SYSDATE(),SYSDATE())";
	var imageQuery = "INSERT INTO IMAGE (boardcd, filename, filedir,vfiledir, regdate, moddate, repyn) VALUE (?,?,?,?,SYSDATE(),SYSDATE(),?)";
	
	//게시판 고유 코드 생성
	var boardcd = "B" + moment().format("YYYYMMDDHHmmssS");
	console.log("boardcd : " + boardcd);
	
	//인스턴스 생성
	var newBoard = new Board({
		"boardcd": boardcd,
		"title": body.title,
		"contents": body.contents,
		"userid": body.userid,
		"regdate": moment().format("YYYY-MM-DD HH:mm:ss"),
		"moddate": moment().format("YYYY-MM-DD HH:mm:ss"),
		"viewcnt":"1"
		});
	
//	기존 mysql query 주석처리	
//	getConnection().query(boardQuery,[boardcd,body.title,body.contents,body.userid], function(){
	newBoard.save(function(err){
		if(err){
			console.log(err);
		}

		var files = req.files;
		var filename = "";
		var vfiledir = "";
		var fileimage_rep_Yn = "";
		var repImage = body.fileimage_rep; //선택된 대표 이미지
		
		for(var i = 0; i < files.length; i++){
			
			filename = files[i].originalname;
			vfiledir = "/image/" +filename;
			
			console.log(filename+","+vfiledir);
			console.log("rep : " + repImage);
			//대표 이미지 선정
			//없을경우 첫 이미지로 대표 이미지 선택
			if(typeof repImage == "undefined" || repImage == null || repImage == ""){
				repImage = filename;
				fileimage_rep_Yn = "Y";
			}
			else if(filename === repImage) {
				fileimage_rep_Yn = "Y";
			} else {
				fileimage_rep_Yn = "N";
			}
			
			//인스턴스 생성
			var newImage = new Image({
				"boardcd": boardcd,
				"filename": filename,
				"filedir": vfiledir,
				"vfiledir": vfiledir,
				"regdate": moment().format("YYYY-MM-DD HH:mm:ss"),
				"moddate": moment().format("YYYY-MM-DD HH:mm:ss"),
				"repyn": fileimage_rep_Yn
				});
//			기존 mysql query 주석처리		
//			getConnection().query(imageQuery,[boardcd,filename,vfiledir,vfiledir,fileimage_rep_Yn], function(err, rows, fields){
			newImage.save(function(err){
			
				if(err) {
					console.log(err);
				}
			});
		}
		res.redirect('/board/list/1');
	});
	
});

//router.get('/view/:seq/:id', function(req, res, next) {
router.get('/view/:seq', function(req, res, next) {
	console.log("board view!!");
	console.log("board view:  "+req.session.sid);
	var seq = req.params.seq;
	//var id = req.params.id;
	var query = "SELECT seq, boardcd, title, contents, userid, regdate, moddate,viewcnt FROM BOARD WHERE seq = ? AND userid = ?";
	var imageQuery="SELECT seq,	boardcd, filename,	filedir, vfiledir, regdate,	moddate FROM IMAGE WHERE boardcd = ?";
	var viewCnt = "UPDATE BOARD set viewcnt = ? where boardcd = ?";
	
	//waterfall 비동기 방식
	async.waterfall([
		function(callback){
			console.log("seq : "+seq);
			//SELECT * FROM BOARD WHERE seq = ? AND userid = ?
			Board.find({_id: seq}).exec(function(err, boardView){
//			기존 mysql query 주석처리
//			getConnection().query(query,[seq,id], function(err, boardView, fields){
		  		if(err) {
		  			console.log("error :"+err);
		  			return;
		  		}
		  		callback(null,boardView[0]);
			});
		},
		function(boardView,callback){
			//SELECT * FROM IMAGE WHERE boardcd = ?
			Image.find({boardcd: boardView.boardcd}).exec(function(err, getImageViewList){
//			기존 mysql query 주석처리
//			getConnection().query(imageQuery,[boardView.boardcd], function(err, getImageViewList, fields){
	  			if(err) {
	  	  			console.log("error :"+err);
	  	  			return;
	  	  		}
	  			callback(null,boardView,getImageViewList);
	  		});
		},
		function(boardView,getImageViewList,callback){
			console.log("ViewCnt");
			var cnt = boardView.viewcnt+1;
			console.log("Count : "+cnt);
			//UPDATE BOARD set viewcnt = ? where boardcd = ?
			Board.updateOne({ boardcd: boardView.boardcd }, { $set: { viewcnt: cnt } }, function (err, result) {
//			기존 mysql query 주석처리
//			getConnection().query(viewCnt,[cnt,boardView.boardcd], function(err, boardView, fields){
		  		if(err) {
		  			console.log("error :"+err);
		  			return;
		  		}
		  		
		  		callback(null);
			});
			res.render('board/view',{boardView:boardView, getImageViewList:getImageViewList,session:req.session});
		}
	]);
	
});


//수정 화면
router.get('/modview/:seq', function(req, res, next) {
	console.log("board modview!!");
	console.log("board modview:  "+req.session.sid);
	
	var seq = req.params.seq;
//	var id = req.params.id;
	
	if(req.session.sid) {
		
		var query = "SELECT seq, boardcd, title, contents, userid, regdate, moddate FROM BOARD WHERE seq = ? AND userid = ?";
		
		var imageQuery="SELECT seq,	boardcd, filename,	filedir, vfiledir, regdate,	moddate FROM IMAGE WHERE boardcd = ?";
		
//		getConnection().query(query,[seq,id], function(err, boardView, fields){
		Board.find({_id: seq}).exec(function(err, boardView){
	  		if(err) {
	  			console.log("error :"+err);
	  			return;
	  		}
	  		
	  		var boardcd = boardView[0].boardcd;
	  		
//	  		getConnection().query(imageQuery,[boardcd], function(err, getImageViewList, fields){
	  		Image.find({boardcd: boardcd}).exec(function(err, getImageViewList){
	  			if(err) {
	  	  			console.log("error :"+err);
	  	  			return;
	  	  		}
	  			
	  			res.render('board/modview',{boardView:boardView[0], getImageViewList:getImageViewList,session:req.session});
	  			
	  		});
			});
		
	}
	else {
		res.redirect('/main/login');
	}
});

//수정 저장 화면
router.post('/modview',upload.array('filenameModify'), function(req, res, next) {
	console.log("board modview save!!");
	console.log("board modview save :  "+req.session.sid);
	
	//var seq = req.params.seq;
	//var id = req.params.id;
	var body = req.body;
	console.log("seq : " + body.seq);
	if(req.session.sid) {
		
		//게시판 고유 코드 생성
		var boardcd = "B" + moment().format("YYYYMMDDHHmmsss");
		console.log("boardcd : " + boardcd);
		
		var query = "UPDATE BOARD SET contents = ?, boardcd = ?, moddate = SYSDATE() WHERE seq = ?";
		var imageQuery="SELECT seq,	boardcd, filename,	filedir, vfiledir, regdate,	moddate FROM IMAGE WHERE boardcd = ?";
		var imageUpdateQuery = "UPDATE IMAGE SET boardcd = ?, repyn = ? WHERE seq = ?";
		var imageAddQuery = "INSERT INTO IMAGE (boardcd, filename, filedir,vfiledir, regdate, moddate, repyn) VALUE (?,?,?,?,SYSDATE(),SYSDATE(),?)";
		
		//이미지 업데이트
//		getConnection().query(query,[body.contents,boardcd,body.seq], function(err, boardView, fields){
		Board.updateOne({ seq: body.seq }, { $set: { contents: body.contents, boardcd: boardcd, moddate: moment().format("YYYY-MM-DD HH:mm:ss") } }, function (err, result) {
	  		if(err) {
	  			console.log("error :"+err);
	  			return;
	  		}
	  		console.log("board update!!");
	  		var fileimage_rep_Yn = "";
	  		var repImage = body.fileimage_rep; //선택된 대표 이미지
	  		var filename = "";
	  		//기존 저장된 이미지 리스트
//	  		getConnection().query(imageQuery,[body.boardcd], function(err, getImageViewList, fields){
	  		Image.find({boardcd: body.boardcd}).exec(function(err, getImageViewList){
	  			if(err) {
	  	  			console.log("error :"+err);
	  	  			return;
	  	  		}
	  			console.log("image List!!");
	  			//기존 저장된 이미지에서 대표이미지가 변경되었는지 확인 후 업데이트
	  			for(var i = 0; i < getImageViewList.length; i++){
	  				
	  				filename = getImageViewList[i].filename;
	  				var imageSeq = getImageViewList[i].seq;
	  				console.log("image list : "+filename+","+imageSeq);
	  				if(typeof repImage == "undefined" || repImage == null || repImage == ""){
	  					repImage = filename;
	  					fileimage_rep_Yn = "Y";
	  				}
	  				else if(filename === repImage) {
	  					fileimage_rep_Yn = "Y";
	  				} else {
	  					fileimage_rep_Yn = "N";
	  				}
	  				
	  				// 대표이미지 변경 업데이트
//	  				getConnection().query(imageUpdateQuery,[boardcd,fileimage_rep_Yn,imageSeq], function(err, getImageViewList, fields){
	  				Image.updateOne({ seq: imageSeq }, { $set: { boardcd: boardcd, repyn: fileimage_rep_Yn } }, function (err, getImageViewList) {	
	  		  			if(err) {
	  		  	  			console.log("error :"+err);
	  		  	  			return;
	  		  	  		}
	  		  			console.log("image update!! "+boardcd +","+fileimage_rep_Yn+"," + imageSeq );
	  				});
	  				
	  			}
	  			
	  			console.log("add image task");
	  			//추가된 이미지 저장
	  			var files = req.files;
	  			var vfiledir = "";
	  			
	  			for(var j = 0; j < files.length; j++){
	  				
	  				filename = files[j].originalname;
	  				vfiledir = "/image/" +filename;
	  				
	  				console.log(filename+","+vfiledir);
	  				console.log("rep : " + repImage);
	  				//대표 이미지 선정
	  				//없을경우 첫 이미지로 대표 이미지 선택
	  				if(typeof repImage == "undefined" || repImage == null || repImage == ""){
	  					repImage = filename;
	  					fileimage_rep_Yn = "Y";
	  				}
	  				else if(filename === repImage) {
	  					fileimage_rep_Yn = "Y";
	  				} else {
	  					fileimage_rep_Yn = "N";
	  				}
	  				
	  				//인스턴스 생성
	  				var newImage = new Image({
	  					"boardcd": boardcd,
	  					"filename": filename,
	  					"filedir": vfiledir,
	  					"vfiledir": vfiledir,
	  					"regdate": moment().format("YYYY-MM-DD HH:mm:ss"),
	  					"moddate": moment().format("YYYY-MM-DD HH:mm:ss"),
	  					"repyn": fileimage_rep_Yn
	  					});
	  			
//	  				getConnection().query(imageAddQuery,[boardcd,filename,vfiledir,vfiledir,fileimage_rep_Yn], function(err, rows, fields){
	  				newImage.save(function(err){
	  				
	  					if(err) {
	  						console.log(err);
	  					}
	  					
	  				});
	  			}
	  			
	  			res.redirect('/board/list/1');
	  			
	  		});
		});
		
	}
	else {
		res.redirect('/main/login');
	}
});


//이미지 삭제
router.post('/del', function(req, res, next) {

	var boardcd = req.body.boardcd;
	var userid = req.body.userid;
	
	console.log("board del :  "+req.session.sid);
	console.log("board del :  "+boardcd + ", "+ userid);
	
	var query = "DELETE FROM BOARD WHERE boardcd = ?";
	var imageQuery="DELETE FROM IMAGE WHERE boardcd = ?";
	
	var Sid = req.session.sid;
	console.log("board del :  "+Sid);
	//session 확인
	if(Sid) {
		if(Sid == userid){
			console.log("board del logic");
			//게시글 삭제
			getConnection().query(query,[boardcd], function(err, view, fields){
		  			if(err) {
		  	  			console.log("error :"+err);
		  	  			return;
		  	  		}
		  			//게시글 관련 이미지 삭제
		  			getConnection().query(imageQuery,[boardcd], function(err, imageview, fields){
		  				if(err) {
			  	  			console.log("error :"+err);
			  	  			return;
			  	  		}
		  				
		  				res.send({result:"SUC"});
		  			});
		  			
				});
		}
		else {
			res.send({result:"DEFSID"});
		}
	}
	else {
		res.send({result:"NOSID"});
	}
});


var pool = mysql.createPool({
	connectionLimit: 10,
	host:config.mysql_db.local.host,
	user: config.mysql_db.local.user,
	password: config.mysql_db.local.password,
	database: config.mysql_db.local.database,
  	dateStrings: 'date' //db의 datetime을 정리된 데이터로 추출
});

function getConnection(){
	return pool;
}

module.exports = router;



