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

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.redirect('/board/list/'+1);
});

// 게시판 목록
router.get('/list/:cur', function(req, res, next) {
	console.log("board list!!");
	console.log("board list:  "+req.session.sid);
	var startPage = 0;
	var endPage = 6;
	var totalPage = 0;
	//if(req.session.sid) {
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
				startPage = (startPage - 1) * 6;
			}
			
			console.log("현재 페이지 : "+ startPage +", 전체 게시판 개수 :"+totalPage);
			
			var pagform = {
					"startPage" : startPage,
					"totalPage" : totalPage,
					"endPage" : endPage
			};
			
			var listQuery = "SELECT seq, boardcd, title, contents,userid, regdate, moddate FROM BOARD ORDER BY moddate DESC limit ?,6";
			var reqImgQuery = "SELECT seq,	boardcd, filename, filedir,	vfiledir, regdate, moddate, repyn FROM IMAGE WHERE repyn = 'Y'";
			
			getConnection().query(listQuery,[startPage], function(err, boardList, fields){
		  		if(err) {
		  			console.log("error :"+err);
		  			return;
		  		}
		  		
		  		getConnection().query(reqImgQuery, function(err, repImageList, fields){
			  		if(err) {
			  			console.log("error :"+err);
			  			return;
			  		}
			  		
			  		res.render('board/list',{boardList:boardList, repImageList:repImageList, pagform:pagform,session:req.session});
		  		});
		  	});
			//getConnection().release();
		});
//	}
//	else {
//		res.redirect('/main/login');
//	}
});
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
	var boardcd = "B" + moment().format("YYYYMMDDHHmmsss");
	console.log("boardcd : " + boardcd);
	
	getConnection().query(boardQuery,[boardcd,body.title,body.contents,body.userid], function(){

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
		
			getConnection().query(imageQuery,[boardcd,filename,vfiledir,vfiledir,fileimage_rep_Yn], function(err, rows, fields){
			
				if(err) {
					console.log(err);
				}
			});
		}
		res.redirect('/board/list/1');
	});
	
});

router.get('/view/:seq/:id', function(req, res, next) {
	console.log("board view!!");
	console.log("board view:  "+req.session.sid);
	var seq = req.params.seq;
	var id = req.params.id;
	var query = "SELECT seq, boardcd, title, contents, userid, regdate, moddate FROM BOARD WHERE seq = ? AND userid = ?";
	
	var imageQuery="SELECT seq,	boardcd, filename,	filedir, vfiledir, regdate,	moddate FROM IMAGE WHERE boardcd = ?";
	
	//waterfall 비동기 방식
	async.waterfall([
		function(callback){
			console.log("seq : "+seq +",id :"+id);
			getConnection().query(query,[seq,id], function(err, boardView, fields){
		  		if(err) {
		  			console.log("error :"+err);
		  			return;
		  		}
		  		
		  		callback(null,boardView[0]);
			});
		},
		function(boardView,callback){
			getConnection().query(imageQuery,[boardView.boardcd], function(err, getImageViewList, fields){
	  			if(err) {
	  	  			console.log("error :"+err);
	  	  			return;
	  	  		}
	  			callback(null,boardView,getImageViewList);
	  		});
		},
		function(boardView,getImageViewList,callback){
			callback(null);
			res.render('board/view',{boardView:boardView, getImageViewList:getImageViewList,session:req.session});
		}
	]);
	
});


//수정 화면
router.get('/modview/:seq/:id', function(req, res, next) {
	console.log("board modview!!");
	console.log("board modview:  "+req.session.sid);
	
	var seq = req.params.seq;
	var id = req.params.id;
	
	if(req.session.sid) {
		
		var query = "SELECT seq, boardcd, title, contents, userid, regdate, moddate FROM BOARD WHERE seq = ? AND userid = ?";
		
		var imageQuery="SELECT seq,	boardcd, filename,	filedir, vfiledir, regdate,	moddate FROM IMAGE WHERE boardcd = ?";
		
		getConnection().query(query,[seq,id], function(err, boardView, fields){
	  		if(err) {
	  			console.log("error :"+err);
	  			return;
	  		}
	  		
	  		var boardcd = boardView[0].boardcd;
	  		
	  		getConnection().query(imageQuery,[boardcd], function(err, getImageViewList, fields){
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
		getConnection().query(query,[body.contents,boardcd,body.seq], function(err, boardView, fields){
	  		if(err) {
	  			console.log("error :"+err);
	  			return;
	  		}
	  		console.log("board update!!");
	  		var fileimage_rep_Yn = "";
	  		var repImage = body.fileimage_rep; //선택된 대표 이미지
	  		var filename = "";
	  		//기존 저장된 이미지 리스트
	  		getConnection().query(imageQuery,[body.boardcd], function(err, getImageViewList, fields){
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
	  				getConnection().query(imageUpdateQuery,[boardcd,fileimage_rep_Yn,imageSeq], function(err, getImageViewList, fields){
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
	  			
	  				getConnection().query(imageAddQuery,[boardcd,filename,vfiledir,vfiledir,fileimage_rep_Yn], function(err, rows, fields){
	  				
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
	host:"192.168.0.98",
  	user: "root",
  	password: "root",
  	database: "BOARD",
  	dateStrings: 'date' //db의 datetime을 정리된 데이터로 추출
});

function getConnection(){
	return pool;
}

module.exports = router;



