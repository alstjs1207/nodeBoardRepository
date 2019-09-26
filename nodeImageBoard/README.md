

## nodeImageBoard

node.js 를 이용한 이미지 게시판 만들기

게시판
- 목록 완료
- 등록 완료
- 수정 완료
- 삭제 완료

로그인 / 로그아웃 완료

회원가입 완료

홈페이지 리뉴얼 완료

# 소셜 로그인(naver) 완료
1. 수정 소스
- app.js
- login.js
- list.ejs
- login.ejs
- config 파일

2. npm 설치
- npm install possport
- npm install passport-naver --save

사이트 참조 : http://www.passportjs.org

3. naver Developers 에서 '네아로' api 등록


# config 파일 작성 완료
1. 수정소스
- config/secrets.js // 중요정보이기 때문에 git에 올리지 않았습니다.
- cinfig/config_info.js
- login.js
- board.js




## Usage

<local>
해당 디렉토리로 이동

shell 실행 후 "npm start" 기동


default port : 3000

start 후 http://localhost:3000 실행

첫 화면은 LIST 입니다.
로그인 없이 모든 게시글을 볼 수 있습니다.

로그인을 해야 본인의 게시글을 수정, 삭제 할 수 있습니다.


## Developing

# node.js
- moment
- multer
- async
- crypto

기능 구현

DB - mysql

DB 구성은 추후에 업로드

### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.
