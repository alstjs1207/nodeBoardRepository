$(function() {
	
	// 총 게시판 수
	var totalPage = $("#totalPage").val();
	
	//나머지를 구한 후 페이지를 맞추기 위해 +1을 더한다.
	var total = parseInt(totalPage/6);
	total = total + 1;
	var li = "";
	var pageform = "";
	var previous = '<li class="page-item"><a class="page-link" href="javascript:goPage(1);" >Previous</a></li>';
	var next = '<li class="page-item"><a class="page-link" href="javascript:goPage('+total+');" >Next</a></li>';
	
	for(var i=1; i <= total;i++) {
		li += '<li class="page-item"><a class="page-link" href="javascript:goPage('+i+');">'+i+'</a><li>';
	}
	
	//페이징 목록 생성
	pageform = previous + li + next;
	
	$("#pageForm").append(pageform);
	
	
})

function goPage(startpage){
		var frm = document.boardListForm;
		frm.action = "/board/list?startPage="+startpage;
		frm.submit();
	}

function boardView(seq,userid){
		var frm = document.boardListForm;
		frm.action = "/board/view?seq="+seq+"&userid="+userid;
		frm.submit();
	}

