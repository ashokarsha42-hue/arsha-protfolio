/* ============================================================
   netlify/functions/admin-login.js
   Serverless function → handles POST /api/admin/login on Netlify
   ============================================================ */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) }; }

  const { email, password } = body;

  if (!email || !password) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email and password required.' }) };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { statusCode: 200, body: JSON.stringify({ token: data.session.access_token }) };
  } catch (err) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials.' }) };
  }
};
