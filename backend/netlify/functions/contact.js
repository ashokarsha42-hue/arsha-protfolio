/* ============================================================
   netlify/functions/contact.js
   Serverless function → handles POST /api/contact on Netlify
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

  const { name, email, message } = body;

  if (!name || !email || !message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'All fields are required.' }) };
  }
  if (!email.includes('@')) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email.' }) };
  }

  try {
    const { error } = await supabase.from('messages').insert([{ name, email, message }]);
    if (error) throw error;
    return { statusCode: 201, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to save message.' }) };
  }
};
