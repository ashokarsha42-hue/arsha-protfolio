/* ============================================================
   server/index.js — Node.js + Express Backend
   Serves frontend files + handles API routes
   ============================================================ */

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { createClient } = require('@supabase/supabase-js');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Supabase (SERVICE KEY — only used server-side, never exposed to browser) ──
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── Middleware ──
app.use(cors());
app.use(express.json());

// Serve frontend files from the ../frontend folder
app.use(express.static(path.join(__dirname, '../../frontend')));

// ============================================================
// API ROUTES
// ============================================================

// POST /api/contact — Save contact form message
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  if (name.length > 100 || message.length > 2000) {
    return res.status(400).json({ error: 'Input too long.' });
  }

  try {
    const { error } = await supabase
      .from('messages')
      .insert([{ name, email, message }]);

    if (error) throw error;
    return res.status(201).json({ success: true, message: 'Message sent!' });
  } catch (err) {
    console.error('[Contact Error]', err.message);
    return res.status(500).json({ error: 'Failed to save message.' });
  }
});

// POST /api/admin/login — Admin authentication via Supabase Auth
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return res.status(200).json({ token: data.session.access_token });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }
});

// GET /api/admin/messages — Fetch all messages (requires valid auth token)
app.get('/api/admin/messages', async (req, res) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token belongs to a real Supabase user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    // Fetch messages using service key
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    console.error('[Admin Messages Error]', err.message);
    return res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

// ── Catch-all: serve frontend index.html ──
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// ── Start Server ──
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║   ARSHA ASHOK PORTFOLIO SERVER       ║');
  console.log('╠══════════════════════════════════════╣');
  console.log(`║   Local:  http://localhost:${PORT}       ║`);
  console.log(`║   Admin:  http://localhost:${PORT}/admin.html ║`);
  console.log('╚══════════════════════════════════════╝\n');
});
