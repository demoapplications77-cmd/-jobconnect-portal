const db = require('../config/db');

exports.createJob = (req, res) => {
  const { title, description, company, location } = req.body;
  const sql = 'INSERT INTO jobs (title, description, company, location) VALUES (?, ?, ?, ?)';
  db.query(sql, [title, description, company, location], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Job created' });
  });
};

exports.getJobs = (req, res) => {
  db.query('SELECT * FROM jobs', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
