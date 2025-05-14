const express = require('express');
const path = require('path');

const app = express();
const port = 3000; // تأكد أن المنفذ هو 3000

// تقديم ملفات React بعد بناء المشروع
app.use(express.static(path.join(__dirname, 'build')));

// المسار الرئيسي للموقع
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// تشغيل السيرفر
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
