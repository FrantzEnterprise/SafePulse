// ── Auth System for SafePulse Admin ──
// Local auth: bcrypt-style hash stored in localStorage
// Future: can be swapped for JWT / OAuth / Firebase Auth

const AUTH_KEY = 'safepulse_auth';
const SALT = 'safepulse_v1';

// Simple SHA-256 hash (no external deps)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(SALT + password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ── Default admin credentials (from config) ──
async function getDefaultAdmin() {
  // These get merged with localStorage on first use
  return {
    username: 'FrantzEnterprise',
    passwordHash: await hashPassword('FE~242SafePulse'),
    allowPasswordChange: true
  };
}

// ── Auth state ──
export function getAuth() {
  try {
    const saved = localStorage.getItem(AUTH_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return null;
}

function saveAuth(data) {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data));
  } catch (e) {}
}

// ── Login ──
export async function login(username, password) {
  const hash = await hashPassword(password);
  const admin = await getDefaultAdmin();
  
  // Check hardcoded admin first
  if (username === admin.username && hash === admin.passwordHash) {
    saveAuth({
      username,
      loggedIn: true,
      loginTime: Date.now(),
      role: 'admin'
    });
    return { success: true, message: 'Welcome back, Robert.' };
  }
  
  // Check if password was changed and saved
  const saved = getAuth();
  if (saved && saved.username === username && saved.passwordHash === hash) {
    saveAuth({
      ...saved,
      loggedIn: true,
      loginTime: Date.now()
    });
    return { success: true, message: 'Welcome back.' };
  }
  
  return { success: false, message: 'Invalid username or password.' };
}

// ── Change Password ──
export async function changePassword(oldPassword, newPassword) {
  const hash = await hashPassword(oldPassword);
  const admin = await getDefaultAdmin();
  
  // Verify old password
  if (hash !== admin.passwordHash) {
    return { success: false, message: 'Current password is incorrect.' };
  }
  
  if (newPassword.length < 8) {
    return { success: false, message: 'New password must be at least 8 characters.' };
  }
  
  const newHash = await hashPassword(newPassword);
  saveAuth({
    username: admin.username,
    passwordHash: newHash,
    loggedIn: true,
    loginTime: Date.now(),
    allowPasswordChange: true,
    passwordChanged: true
  });
  
  return { success: true, message: 'Password changed successfully.' };
}

// ── Logout ──
export function logout() {
  const auth = getAuth();
  if (auth) {
    saveAuth({ ...auth, loggedIn: false });
  }
}

// ── Check if logged in ──
export function isLoggedIn() {
  const auth = getAuth();
  if (!auth || !auth.loggedIn) return false;
  
  // Session timeout: 24 hours
  const maxAge = 24 * 60 * 60 * 1000;
  if (Date.now() - auth.loginTime > maxAge) {
    logout();
    return false;
  }
  
  return true;
}

// ── Auto-logout on tab close ──
export function setupSessionCleanup() {
  // On page unload, mark session ended
  window.addEventListener('beforeunload', () => {
    // Keep logged in for 24h as configured above
  });
}
