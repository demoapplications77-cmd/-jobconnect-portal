const db = require('../config/db');
const bcrypt = require('bcryptjs');

// REGISTERING NEW USER

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Checking for existing user
    const checkSql = 'SELECT * FROM users WHERE email = ?';
    db.query(checkSql, [email], async (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      if (results.length > 0) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hashing password and inserting new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertSql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
      db.query(insertSql, [name, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error creating user' });

        const newUser = {
          id: result.insertId,
          name,
          email
        };

        res.status(201).json({
          message: 'Registration successful!',
          user: newUser
        });
      });
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// LOGIN OF EXISTING USER

exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid email or password' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  });
};
