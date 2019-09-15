
function boardView(seq,userid){
		var frm = document.boardListForm;
		frm.action = "/board/view?seq="+seq+"&userid="+userid;
		frm.submit();
	}

$(function() {
	$("#filename").on("change", handleImgFileSelect);
	
	$("#filenameModify").on("change", handleImgFileSelectModify);
})

//이미지 미리보기
function handleImgFileSelect(e) {
	
	var sel_files = [];
	
	$("#img_wrap").empty();
	
	var files = e.target.files;
	var filesArr = Array.prototype.slice.call(files);

	var idx = 0;
	filesArr.forEach(function(file){
		
		if(!file.type.match("image/jpeg") && 
		   !file.type.match("image/png") &&
		   !file.type.match("image/gif")) {
			alert("jpeg, png, gif 이미지만 가능합니다.");
			return false;
		}
		
		var filesize = file.size / 1024 / 1024;
		if(filesize > 10) {
			alert("이미지 size는 10Mbyte 미만으로 가능합니다.");
			return false;
		}
		
		sel_files.push(file);
		
		var reader = new FileReader();
		reader.onload = function(e) {
			var imags = "<img id='fileimage_"+idx+"' name='"+file.name+"' src=\"" + e.target.result + "\" onclick='repimage("+idx+")' />";
			$("#img_wrap").append(imags);
			idx++;
		}
		reader.readAsDataURL(file);
	});
}

//이미지 미리보기
function handleImgFileSelectModify(e) {
	
	var sel_files = [];
	
	$("#img_wrap").empty();
	
	var files = e.target.files;
	var filesArr = Array.prototype.slice.call(files);

	var idx = $("#imgLastCnt").val();
	filesArr.forEach(function(file){
		
		if(!file.type.match("image/jpeg") && 
		   !file.type.match("image/png") &&
		   !file.type.match("image/gif")) {
			alert("jpeg, png, gif 이미지만 가능합니다.");
			return false;
		}
		
		var filesize = file.size / 1024 / 1024;
		if(filesize > 10) {
			alert("이미지 size는 10Mbyte 미만으로 가능합니다.");
			return false;
		}
		
		sel_files.push(file);
		
		var reader = new FileReader();
		reader.onload = function(e) {
			var imags = "<img id='fileimage_"+idx+"' name='"+file.name+"' src=\"" + e.target.result + "\" onclick='repimage("+idx+")' />";
			$("#img_wrap").append(imags);
			idx++;
		}
		reader.readAsDataURL(file);
	});
}

// 대표이미지 선택 시
function repimage(idx) {
	// hidden 값 초기화
	$("#imageH").empty();
	
	// 이미지 id
	var repimage = "#fileimage_"+idx;
	// 파일 이름
	var filename = $(repimage)[0].name;
		
	var images = $("#img_wrap").children('img');
	var imgCnt = images.length;
	
	var images_old = $("#img_wrap_old").children();
	var imgOldCnt = images_old.length;
	
	var total  = +imgCnt + imgOldCnt;

	for(var i=0; i < total;i++) {
		var image = "#fileimage_"+i;
		//초기화
		$(image).css({
			border: ''
		});
	}
	
	
	// 선택한 대표 이미지 css 적용
	$(repimage).css({
		border: '3px solid green'
	});
	
	// 선택한 대표 이미지를 전달 할 hidden 값 생성
	var hidden = "<input type='hidden' id='"+filename+"' name='fileimage_rep' value='"+filename+"' />";
	$('#imageH').append(hidden);
}
