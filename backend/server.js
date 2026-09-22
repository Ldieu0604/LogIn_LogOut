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

// Mock Organizations & Memberships
const MOCK_ORGANIZATIONS = [
  { slug: 'vinai-org', name: 'VinAI Org', description: 'VinAI Annotation Project' },
  { slug: 'test-org', name: 'Test Org', description: 'Testing Organization' }
];

// Mapping User ID -> list of organizations and their role in it
const MOCK_MEMBERSHIPS = {
  // admin is an owner of vinai-org
  1: [{ organization: MOCK_ORGANIZATIONS[0], role: 'owner' }], 
  // user is a worker in vinai-org and supervisor in test-org
  2: [
    { organization: MOCK_ORGANIZATIONS[0], role: 'worker' },
    { organization: MOCK_ORGANIZATIONS[1], role: 'supervisor' }
  ],
  // worker is just a worker in test-org
  3: [{ organization: MOCK_ORGANIZATIONS[1], role: 'worker' }],
  4: [{ organization: MOCK_ORGANIZATIONS[0], role: 'supervisor' }]
};

// 1. Mock Login Endpoint (POST /api/auth/login)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (MOCK_USERS[username] && MOCK_USERS[username].password === password) {
    res.json({ key: MOCK_USERS[username].token });
  } else {
    res.status(400).json({ non_field_errors: ['Unable to log in with provided credentials.'] });
  }
});

// Helper to get user from token
const getUserFromReq = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Token ')) return null;
  return MOCK_TOKENS[authHeader.split(' ')[1]];
};

// 2. Mock Get Current User Endpoint (GET /api/users/self)
app.get('/api/users/self', (req, res) => {
  const user = getUserFromReq(req);
  if (user) {
    const isSuperuser = user.groups.includes('admin');
    res.json({
      id: user.id,
      username: user.groups[0],
      first_name: '',
      last_name: '',
      email: `${user.groups[0]}@example.com`,
      groups: user.groups,
      is_staff: isSuperuser,
      is_superuser: isSuperuser, // Admin will have is_superuser: true
      is_active: true
    });
  } else {
    res.status(401).json({ detail: 'Invalid token.' });
  }
});

// 3. Mock Get Organizations Endpoint (GET /api/organizations)
app.get('/api/organizations', (req, res) => {
  const user = getUserFromReq(req);
  if (!user) {
    return res.status(401).json({ detail: 'Invalid token.' });
  }

  const memberships = MOCK_MEMBERSHIPS[user.id] || [];
  
  // Format matches CVAT API (returns results array)
  const results = memberships.map(m => ({
    ...m.organization,
    membership_role: m.role 
  }));

  res.json({
    count: results.length,
    results: results
  });
});

app.listen(PORT, () => {
  console.log(`[Mock Server] CVAT Auth API is running on http://localhost:${PORT}`);
});
