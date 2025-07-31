// Creating navigation to switching between sections

function showSection(sectionId) {
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(sec => sec.classList.remove('active'));
  document.getElementById(sectionId + '-section').classList.add('active');

  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => link.classList.remove('active'));
  document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
}

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const section = this.dataset.section;
    if ((section === 'post-job' || section === 'resume') && !isLoggedIn()) {
      showLoginModal();
    } else {
      showSection(section);
    }
  });
});

function toggleMobileMenu() {
  document.getElementById('nav-links').classList.toggle('active');
}

// Simulated Login Checking

function isLoggedIn() {
  return localStorage.getItem('jobconnect_user_loggedin') === 'true';
}

function showLoginModal() {
  document.getElementById('login-modal').style.display = 'flex';
}

function closeLoginModal() {
  document.getElementById('login-modal').style.display = 'none';
}

// Registration Logic

document.getElementById('register-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('register-msg').innerText = data.message || 'Registration successful!';
      document.getElementById('register-msg').classList.add('message', 'message-success', 'show');
      localStorage.setItem('jobconnect_user_loggedin', 'true');
      if (data.user && data.user.id) {
        localStorage.setItem('jobconnect_user_id', data.user.id);
      }
      showSection('jobs');
    })
    .catch(err => {
      console.error('Registration error:', err);
      document.getElementById('register-msg').innerText = 'Error registering user.';
      document.getElementById('register-msg').classList.add('message', 'message-error', 'show');
    });

});

// Login Logic

document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success || data.token) {
        localStorage.setItem('jobconnect_user_loggedin', 'true');
        if (data.user && data.user.id) {
          localStorage.setItem('jobconnect_user_id', data.user.id);
        }
        closeLoginModal();
        showSection('jobs');
        fetchAndRenderJobs();
      } else {
        document.getElementById('login-msg').innerText = data.message || 'Invalid login credentials';
      }
    })
    .catch(err => {
      console.error('Login error:', err);
      document.getElementById('login-msg').innerText = 'Login failed.';
    });
});

document.getElementById('login-close').addEventListener('click', closeLoginModal);

// Job Posting

document.getElementById('job-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const title = document.getElementById('job-title').value.trim();
  const company = document.getElementById('company').value.trim();
  const location = document.getElementById('location').value.trim();
  const description = document.getElementById('description').value.trim();
  const salary = document.getElementById('salary').value.trim();
  const tags = document.getElementById('tags').value.trim();

  fetch('http://localhost:5000/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, company, location, description, salary, tags })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('job-msg').innerText = data.message || 'Job posted successfully!';
      document.getElementById('job-msg').classList.add('message', 'message-success', 'show');
      fetchAndRenderJobs();
    })
    .catch(err => {
      console.error('Job post error:', err);
      document.getElementById('job-msg').innerText = 'Error adding job.';
      document.getElementById('job-msg').classList.add('message', 'message-error', 'show');
    });
});

// Resume Uploading

document.getElementById('resume-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const fileInput = document.getElementById('resume-file');
  const formData = new FormData();
  formData.append('resume', fileInput.files[0]);

  const userId = localStorage.getItem('jobconnect_user_id') || '1';
  formData.append('user_id', userId);

  fetch('http://localhost:5000/api/resume', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('resume-msg').innerText = data.message || 'Resume uploaded!';
      document.getElementById('resume-msg').classList.add('message', 'message-success', 'show');
    })
    .catch(err => {
      console.error('Resume upload error:', err);
      document.getElementById('resume-msg').innerText = 'Error uploading resume.';
      document.getElementById('resume-msg').classList.add('message', 'message-error', 'show');
    });
});

// Loading and Displaying Jobs 

let allJobs = [];

function fetchAndRenderJobs() {
  fetch('http://localhost:5000/api/jobs')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('job-list');
      const dbJobs = Array.isArray(data) ? data : [];
      const sampleJobs = getSampleJobs();
      allJobs = [...dbJobs, ...sampleJobs];
      renderJobs(allJobs, container);
    })
    .catch(err => {
      console.error('Fetch jobs error:', err);
      const container = document.getElementById('job-list');
      allJobs = getSampleJobs();
      renderJobs(allJobs, container);
    });
}

// Initial loadings
fetchAndRenderJobs();

function renderJobs(jobs, container) {
  container.innerHTML = '';
  jobs.forEach(job => {
    const div = document.createElement('div');
    div.className = 'job-card';
    div.innerHTML = `
      <div class="job-header">
        <div>
          <h3 class="job-title">${job.title}</h3>
          <p class="job-company"><a href="#">${job.company}</a></p>
          <p class="job-location"><i class="fas fa-map-marker-alt"></i> ${job.location}</p>
        </div>
        <div class="job-salary">${job.salary || ''}</div>
      </div>
      <p class="job-description">${job.description}</p>
      <div class="job-meta">
        <div class="job-tags">
          ${(job.tags || '').split(',').map(tag => `<span class="job-tag">${tag.trim()}</span>`).join('')}
        </div>
        <div class="job-posted">Posted ${job.posted || 'recently'}</div>
      </div>
    `;
    container.appendChild(div);
  });
}

function getSampleJobs() {
  return [
    {
      title: "Senior Software Engineer",
      company: "TechCorp Solutions Ltd",
      location: "London, UK",
      salary: "£65k - £85k",
      description: "We're looking for an experienced software engineer to join our growing team in London. You'll work on cutting-edge fintech applications using modern technologies and collaborate with cross-functional teams.",
      tags: "JavaScript, React, Node.js, Full-time",
      posted: "2 days ago"
    },
    {
      title: "Frontend Developer",
      company: "PixelForge",
      location: "Manchester, UK",
      salary: "£50k - £70k",
      description: "Develop and maintain engaging UIs using Vue.js and SCSS. Collaborate with designers and backend engineers.",
      tags: "Vue.js, SCSS, Git, Full-time",
      posted: "3 days ago"
    },
    {
      title: "Data Analyst",
      company: "InsightPro",
      location: "Remote (UK)",
      salary: "£45k - £55k",
      description: "Join our analytics team to process and interpret data trends using Python and SQL.",
      tags: "SQL, Python, Power BI, Remote",
      posted: "1 week ago"
    },
    {
      title: "Junior DevOps Engineer",
      company: "CloudOps UK",
      location: "Birmingham, UK",
      salary: "£40k - £50k",
      description: "Support deployment pipelines, CI/CD, and infrastructure automation with Docker and Jenkins.",
      tags: "Docker, Jenkins, Linux, Entry-level",
      posted: "5 days ago"
    }
  ];
}

// Job Searching Feature

function searchJobs() {
  const keyword = document.getElementById('job-search').value.toLowerCase();
  const location = document.getElementById('location-filter').value.toLowerCase();

  const filtered = allJobs.filter(job => {
    const titleMatch = job.title.toLowerCase().includes(keyword);
    const companyMatch = job.company.toLowerCase().includes(keyword);
    const tagMatch = (job.tags || '').toLowerCase().includes(keyword);
    const locationMatch = location === '' || job.location.toLowerCase().includes(location);
    return (titleMatch || companyMatch || tagMatch) && locationMatch;
  });

  renderJobs(filtered, document.getElementById('job-list'));
}
