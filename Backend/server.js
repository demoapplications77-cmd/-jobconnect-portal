// IMPORTING & CONFIGURATION
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');

// Loading environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// STATIC FRONTEND
const frontendPath = path.join(__dirname, '../Frontend');
app.use(express.static(frontendPath));

// Default route serves index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ROUTES
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const resumeRoutes = require('./routes/resume');

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resume', resumeRoutes);

// Serving uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// STARTING SERVER
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


