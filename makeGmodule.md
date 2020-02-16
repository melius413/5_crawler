## 콘솔에서 실행되는 모듈 만들기
글로벌로 설치된 모듈은 콘솔에서 주로 실행된다.
~~~bash
npm i -g module_name
~~~

개발된 모듈은 npm에 올릴 수 있다.
~~~bash
npm publish
~~~
npm에 등록된 모듈의 진입점은 package.json의 main에 기입된 파일
~~~js
{
  "name": "7_crawler",
  "version": "1.0.0",
  "description": "",
  "main": "index.js", // <- 해당 부분이 진입점
  "author": "",
  "license": "ISC"
  // ...
}
~~~
진입파일의 맨위에 Annotation기입
리눅스에서 인되는 명령이며, node를 실행하라는 의미
(리눅스는 해당위치에 노드가 설치됨)
(윈도우에서는 해당 Annotation 무시)
~~~js
#!/usr/bin/env node
~~~
콘솔에서 사용할 명령은 package.json의 bin에 키값 형태로 기입
~~~js
{
  "name": "7_crawler",
  // ...
  "author": "",
  "license": "ISC",
  "bin": {
    "crawler": "./index.js" // <- 해당 키가 콘솔에서 실행명령어
  }
}
~~~
개발한 모듈을 글로벌로 설치
~~~bash
npm i -g
~~~
콘솔에서 실행
~~~bash
crawler
~~~