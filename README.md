# Arsha Ashok — Portfolio Website

---

## 📁 Folder Structure

```
arsha-portfolio/
│
├── 📂 frontend/                  ← All UI files (open in browser)
│   ├── index.html                ← Main portfolio page
│   ├── admin.html                ← Admin panel page
│   ├── css/
│   │   └── style.css             ← Dark cyberpunk theme
│   └── js/
│       ├── script.js             ← Contact form logic
│       └── admin.js              ← Admin login + view messages
│
└── 📂 backend/                   ← Node.js server + serverless functions
    ├── server/
    │   └── index.js              ← Express server (local dev)
    ├── netlify/
    │   └── functions/
    │       ├── contact.js        ← POST /api/contact (Netlify deploy)
    │       ├── admin-login.js    ← POST /api/admin/login
    │       └── admin-messages.js ← GET  /api/admin/messages
    ├── package.json
    ├── netlify.toml              ← Netlify deploy config
    ├── .env                      ← ⚠️ Your secret keys (never commit!)
    └── .env.example              ← Safe template for GitHub
```

---

## 🚀 HOW TO RUN (Step by Step)

### ✅ STEP 1 — Supabase Setup

1. Go to **https://supabase.com** → Sign up → **New Project**
   - Name: `arsha-portfolio` · Region: Southeast Asia (Singapore)

2. Go to **SQL Editor** → paste and run:

```sql
create table messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamp with time zone default now()
);
alter table messages enable row level security;
create policy "Anyone can insert" on messages for insert with check (true);
create policy "Only admin can read" on messages for select using (auth.role() = 'authenticated');
```

3. Go to **Authentication → Users → Add user** → create your admin email + password

4. Go to **Settings → API** → copy:
   - **Project URL** (e.g. `https://abcxyz.supabase.co`)
   - **service_role key** (the long one under "Secret")

---

### ✅ STEP 2 — Add Your Keys

Open `backend/.env` and fill in:

```
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
PORT=3000
```

---

### ✅ STEP 3 — Install & Run Locally

Open terminal inside the `backend/` folder:

```bash
npm install
npm run dev
```

Open browser → **http://localhost:3000**
Admin panel → **http://localhost:3000/admin.html**

---

### ✅ STEP 4 — Push to GitHub

In the root `arsha-portfolio/` folder:

```bash
git init
git add .
git commit -m "Arsha Ashok portfolio - initial commit"
```

On **https://github.com** → New repository → name it `arsha-portfolio` → copy the URL, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/arsha-portfolio.git
git branch -M main
git push -u origin main
```

---

### ✅ STEP 5 — Deploy to Netlify

1. Go to **https://netlify.com** → Sign up with GitHub
2. Click **"Add new site" → "Import from Git"** → select your `arsha-portfolio` repo
3. Set **Base directory** to `backend`
4. Leave build command blank (already in netlify.toml)
5. Go to **Site settings → Environment variables** → add:
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_SERVICE_KEY` = your service role key
6. Click **Deploy site** → 🎉 Live in ~1 minute!

---

## 🔐 Admin Panel

- URL: `https://your-site.netlify.app/admin.html`
- Login with the email + password you created in Supabase Auth
- See all contact form submissions in a table

---

## ⚠️ Important Notes

| Thing | Why |
|---|---|
| Use `service_role` key (not anon) | More permissions needed server-side |
| Never commit `.env` | Your keys are secret — `.gitignore` handles this |
| `.env.example` is safe to commit | It's just a blank template |
| `node_modules/` is ignored | Run `npm install` to recreate it |
