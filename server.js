const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';
const DATA_FILE = path.join(__dirname, 'responses.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readResponses() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writeResponses(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Called by the page when she picks yes and confirms a date/time
app.post('/api/respond', (req, res) => {
  const { answer, date, time, note } = req.body || {};

  if (!answer) {
    return res.status(400).json({ error: 'answer is required' });
  }

  const responses = readResponses();
  responses.push({
    answer,                 // "yes" or "no"
    date: date || '',
    time: time || '',
    note: note || '',
    submittedAt: new Date().toISOString(),
  });
  writeResponses(responses);
  res.json({ ok: true });
});

// Simple password gate for anything under /admin or /api/responses
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).send('Authentication required');
  }
  const decoded = Buffer.from(auth.split(' ')[1], 'base64').toString();
  const password = decoded.split(':')[1];
  if (password !== ADMIN_PASSWORD) {
    res.set('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).send('Wrong password');
  }
  next();
}

app.get('/api/responses', requireAdmin, (req, res) => {
  res.json(readResponses());
});

// Human-readable dashboard of everything she's picked
app.get('/admin', requireAdmin, (req, res) => {
  const responses = readResponses().slice().reverse();
  const rows = responses.map(r => `
    <tr>
      <td>${r.answer === 'yes' ? '💛 yes' : '— no'}</td>
      <td>${r.date}</td>
      <td>${r.time}</td>
      <td>${(r.note || '').replace(/</g, '&lt;')}</td>
      <td>${new Date(r.submittedAt).toLocaleString()}</td>
    </tr>`).join('');

  res.send(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Responses</title>
<style>
  body { font-family: -apple-system, sans-serif; background: #FFF6EF; padding: 32px; color: #5A3346; }
  h1 { margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(90,51,70,0.08); }
  th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #FBD9D9; }
  th { background: #FBD9D9; }
  tr:last-child td { border-bottom: none; }
</style>
</head>
<body>
  <h1>Her picks (${responses.length})</h1>
  <table>
    <tr><th>Answer</th><th>Date</th><th>Time</th><th>Note</th><th>Submitted</th></tr>
    ${rows || '<tr><td colspan="5">No responses yet</td></tr>'}
  </table>
</body>
</html>`);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
