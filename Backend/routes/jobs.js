const express = require('express');
const router = express.Router();
const { createJob, getJobs } = require('../controllers/jobController');

// POST /api/jobs
router.post('/', createJob);

// GET /api/jobs
router.get('/', getJobs);

module.exports = router;
