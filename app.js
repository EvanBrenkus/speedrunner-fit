// ─────────────────────────────────────────
//  app.js — SpeedRunner.fit
//  Supabase connection + shared utilities
// ─────────────────────────────────────────

// Pull keys from environment (Netlify injects these at build time)
// For local development, replace these strings with your actual values
// NEVER commit real keys — use Netlify environment variables in production
const SUPABASE_URL = window.ENV_SUPABASE_URL || 'https://hnudrsuobqzedpptmosa.supabase.co';
const SUPABASE_ANON_KEY = window.ENV_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudWRyc3VvYnF6ZWRwcHRtb3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDQ2NDEsImV4cCI6MjA5NDU4MDY0MX0.WxGV4d6Ew4U8cXiZVcpgW40gClJ7';

// Initialise Supabase client
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth helpers ──────────────────────────

async function getSession() {
  const { data } = await db.auth.getSession();
  return data.session;
}

async function getUser() {
  const { data } = await db.auth.getUser();
  return data.user;
}

async function signOut() {
  await db.auth.signOut();
  window.location.href = '/index.html';
}

// Redirect to login if not authenticated
async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = '/pages/login.html';
    return null;
  }
  return session;
}

// ── Score formula ─────────────────────────

// Score = game time (minutes) / average MPH
// Lower is better — faster game + faster running = lower score
function calcScore(gameTimeSeconds, avgMph) {
  const minutes = gameTimeSeconds / 60;
  return minutes / avgMph;
}

function formatScore(score) {
  return score.toFixed(2);
}

// ── Time formatting ───────────────────────

function secondsToDisplay(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}

function displayToSeconds(hms) {
  const parts = hms.split(':').map(Number);
  if (parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];
  if (parts.length === 2) return parts[0]*60 + parts[1];
  return Number(hms);
}

// ── UI helpers ────────────────────────────

function showAlert(id, message, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = `alert alert-${type} visible`;
}

function hideAlert(id) {
  const el = document.getElementById(id);
  if (el) el.className = 'alert';
}

function setLoading(btnId, loading, text = 'Submit') {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait...' : text;
}

// ── Avatar ────────────────────────────────

const AVATAR_COLORS = [
  { bg: '#EEEDFE', color: '#3C3489' },
  { bg: '#E1F5EE', color: '#085041' },
  { bg: '#FAEEDA', color: '#633806' },
  { bg: '#FAECE7', color: '#712B13' },
];

function avatarColors(username) {
  const i = (username.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[i];
}

function renderAvatar(username, size = 30) {
  const initials = username.slice(0, 2).toUpperCase();
  const { bg, color } = avatarColors(username);
  return `<span class="lb-avatar" style="width:${size}px;height:${size}px;background:${bg};color:${color};">${initials}</span>`;
}

// ── Nav: highlight active page ────────────

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a, .sidebar-link').forEach(link => {
    if (link.getAttribute('href') && path.endsWith(link.getAttribute('href').split('/').pop())) {
      link.classList.add('active');
    }
  });
});
