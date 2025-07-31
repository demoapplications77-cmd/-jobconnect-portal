const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload');
const db = require('../config/db');

router.post('/', upload.single('resume'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Getting user_id from frontend
  const userId = req.body.user_id;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const filePath = req.file.path.replace(/\\/g, '/'); 

  // Inserting into DB with user_id
  const query = 'INSERT INTO resumes (user_id, file_path) VALUES (?, ?)';
  db.query(query, [userId, filePath], (err, result) => {
    if (err) {
      console.error('DB insert error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(200).json({ message: 'Resume uploaded and saved successfully' });
  });
});

module.exports = router;

