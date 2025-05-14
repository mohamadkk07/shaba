const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../match-hub-frontend/build')));

// أي مسار غير معروف يرجع index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../match-hub-frontend/build', 'index.html'));
});

// Start the backend server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
