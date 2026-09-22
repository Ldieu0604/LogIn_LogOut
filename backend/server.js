const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mock Data
const MOCK_USERS = {
  'admin': { password: 'password123', token: 'mock-token-admin', id: 1, groups: ['admin'] },
  'user': { password: 'password123', token: 'mock-token-user', id: 2, groups: ['user'] },
  'worker': { password: 'password123', token: 'mock-token-worker', id: 3, groups: ['worker'] },
  'supervisor': { password: 'password123', token: 'mock-token-supervisor', id: 4, groups: ['supervisor'] },
};

const MOCK_TOKENS = {
  'mock-token-admin': MOCK_USERS['admin'],
  'mock-token-user': MOCK_USERS['user'],
  'mock-token-worker': MOCK_USERS['worker'],
  'mock-token-supervisor': MOCK_USERS['supervisor'],
};

// 1. Mock Login Endpoint (POST /api/auth/login)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log(`[Mock Server] Login attempt for: ${username}`);

  if (MOCK_USERS[username] && MOCK_USERS[username].password === password) {
    res.json({ key: MOCK_USERS[username].token });
  } else {
    res.status(400).json({ non_field_errors: ['Unable to log in with provided credentials.'] });
  }
});

// 2. Mock Get Current User Endpoint (GET /api/users/self)
app.get('/api/users/self', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Token ')) {
    return res.status(401).json({ detail: 'Authentication credentials were not provided.' });
  }

  const token = authHeader.split(' ')[1];
  const user = MOCK_TOKENS[token];

  if (user) {
    console.log(`[Mock Server] Retrieved self data for: ${user.groups[0]}`);
    // Simulate CVAT user response
    res.json({
      id: user.id,
      username: user.groups[0],
      first_name: '',
      last_name: '',
      email: `${user.groups[0]}@example.com`,
      groups: user.groups,
      is_staff: user.groups.includes('admin'),
      is_superuser: user.groups.includes('admin'),
      is_active: true
    });
  } else {
    res.status(401).json({ detail: 'Invalid token.' });
  }
});

app.listen(PORT, () => {
  console.log(`[Mock Server] CVAT Auth API is running on http://localhost:${PORT}`);
  console.log('Available test accounts (username:password) -> admin:password123, user:password123, worker:password123');
});
