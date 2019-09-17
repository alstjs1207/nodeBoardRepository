function boardDel(boardcd, userid){
	
	$.ajax({
			type :'post'
			, url : '/board/del'
			, data : {boardcd : boardcd,
					  userid : userid}
			, dataType : "json"
			, cache : false 
			, contentType: "application/x-www-form-urlencoded; charset=UTF-8"
			, success:function(json) {
				if(json.result == 'SUC'){
					alert("게시글이 삭제되었습니다.");
					
					location.href="/board/list/1";
				}
				else if(json.result == 'NOSID'){
					alert("SESSION 정보가 없습니다.");
				}
				else if(json.result == 'DEFSID'){
					alert("작성자와 다른 사용자 요청입니다.");
				}
		    }
			,error:function(xhr,textStatus){
				alert("게시글 삭제 중 장애가 발생되었습니다.");
			}
	});
		
}


