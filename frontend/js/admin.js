/* ============================================================
   admin.js — Admin Panel
   Calls Node.js backend → /api/admin/login & /api/admin/messages
   ============================================================ */

let adminToken = null;

// Auto-login if token saved in session
window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('admin_token');
  if (saved) {
    adminToken = saved;
    showAdminPanel();
  }
});

async function adminLogin() {
  const email    = document.getElementById('admin-email').value.trim();
  const password = document.getElementById('admin-password').value;
  const errEl    = document.getElementById('login-error');
  const btn      = document.querySelector('#login-section .submit-btn');

  errEl.style.display = 'none';
  btn.disabled = true;
  btn.querySelector('span').textContent = 'AUTHENTICATING...';

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      adminToken = data.token;
      sessionStorage.setItem('admin_token', adminToken);
      showAdminPanel();
    } else {
      throw new Error(data.error || 'Invalid credentials');
    }
  } catch (e) {
    errEl.textContent = `[ ERROR ] ${e.message}`;
    errEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.querySelector('span').textContent = 'LOGIN >>';
  }
}

function adminLogout() {
  sessionStorage.removeItem('admin_token');
  adminToken = null;
  document.getElementById('admin-section').style.display = 'none';
  document.getElementById('login-section').style.display = 'block';
}

function showAdminPanel() {
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('admin-section').style.display = 'block';
  loadMessages();
}

async function loadMessages() {
  const container = document.getElementById('messages-container');
  container.innerHTML = '<div class="loading-msg">[ FETCHING DATA... ]</div>';

  try {
    const res = await fetch('/api/admin/messages', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    if (res.status === 401) { adminLogout(); return; }

    const data = await res.json();

    if (!data || data.length === 0) {
      container.innerHTML = '<div class="no-msg">[ NO MESSAGES YET ]</div>';
      return;
    }

    const rows = data.map(msg => {
      const date = new Date(msg.created_at).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      return `
        <tr>
          <td>${esc(msg.name)}</td>
          <td>
            <a href="mailto:${esc(msg.email)}"
               style="color:var(--accent2);text-decoration:none;">
              ${esc(msg.email)}
            </a>
          </td>
          <td>${esc(msg.message)}</td>
          <td style="white-space:nowrap;color:var(--muted);">${date}</td>
        </tr>`;
    }).join('');

    container.innerHTML = `
      <table class="messages-table">
        <thead>
          <tr>
            <th>NAME</th>
            <th>EMAIL</th>
            <th>MESSAGE</th>
            <th>RECEIVED</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;

  } catch (e) {
    container.innerHTML = `
      <div class="no-msg" style="color:var(--red);">
        [ ERROR ] ${e.message}
      </div>`;
  }
}

// Sanitize HTML output
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
