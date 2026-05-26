const jsonServer = require('json-server');
const express = require('express');
const cors = require('cors');

const app = express();
const router = jsonServer.router('db.json');

app.use(cors());

// 1. 기존 json-server의 용량 제한 문제로 인한 커스텀 설정 (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 2. json-server가 건드리기 전에 먼저 PATCH 요청을 intercept
app.patch('/books/:id', (req, res) => {
  console.log(`\n[서버] ID ${req.params.id}번 도서 이미지 저장 요청 intercept 성공!`);
  
  const db = router.db; // db.json 파일에 직접 접근
  const book = db.get('books').find({ id: req.params.id }).value();

  if (book) {
    db.get('books').find({ id: req.params.id }).assign(req.body).write();
    console.log(`[서버] DB 저장 완료!`);
    
    res.json(db.get('books').find({ id: req.params.id }).value());
  } else {
    res.status(404).json({ error: '책을 찾을 수 없습니다.' });
  }
});

// 3. 나머지 일반 요청(GET, POST)은 원래대로 json-server가 처리하도록 넘김
app.use(router);

app.listen(3000, () => {
  console.log('🖥️ 서버가 포트 3000에서 실행 중...');
});