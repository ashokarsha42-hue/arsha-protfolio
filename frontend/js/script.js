/* ============================================================
   script.js — Contact Form
   Sends data to Node.js backend → POST /api/contact
   ============================================================ */

async function submitForm() {
  const name    = document.getElementById('fname').value.trim();
  const email   = document.getElementById('femail').value.trim();
  const message = document.getElementById('fmessage').value.trim();
  const status  = document.getElementById('form-status');
  const btn     = document.querySelector('.submit-btn');

  // Reset status
  status.className = '';
  status.style.display = 'none';

  // Validate
  if (!name || !email || !message) {
    status.textContent = '[ ERROR ] All fields are required.';
    status.className = 'status-error';
    return;
  }

  btn.querySelector('span').textContent = 'TRANSMITTING...';
  btn.disabled = true;

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });

    const data = await res.json();

    if (res.ok) {
      status.textContent = '[ SUCCESS ] Message sent! I will get back to you soon.';
      status.className = 'status-success';
      document.getElementById('fname').value    = '';
      document.getElementById('femail').value   = '';
      document.getElementById('fmessage').value = '';
    } else {
      throw new Error(data.error || 'Server error');
    }
  } catch (e) {
    status.textContent = `[ ERROR ] ${e.message}`;
    status.className = 'status-error';
  } finally {
    btn.querySelector('span').textContent = 'SEND MESSAGE >>';
    btn.disabled = false;
  }
}
