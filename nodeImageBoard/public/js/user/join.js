function joinchk() {
	
	alert("가입이 완료되었습니다. \ 로그인 창으로 이동합니다.");
	 var f = document.joinForm;
	 f.action = '/join/reg';
	 f.submit();
	 
	 return true;
}