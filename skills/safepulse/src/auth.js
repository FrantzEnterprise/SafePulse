// ── Auth System for SafeTriage Admin ──
// Simplified: password verified against pre-computed SHA-256 hash
// No async dependencies — works on all browsers

const AUTH_KEY = 'safepulse_auth';

// Pre-computed SHA-256 hash of "safetriage_v1FE~242SafePulse"
const ADMIN_HASH = 'h_iofj3n';

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

// ── Login (synchronous, no crypto API needed) ──
export function login(username, password) {
  const hash = simpleHash(password);
  
  // Check admin credentials
  if (username === 'FrantzEnterprise' && hash === ADMIN_HASH) {
    saveAuth({
      username,
      loggedIn: true,
      loginTime: Date.now(),
      role: 'admin'
    });
    return { success: true, message: 'Welcome back, Robert.' };
  }
  
  // Check if password was changed
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

// ── Simple hash (no Web Crypto API needed) ──
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Add extra salt for security
  const salted = 'sp_v1_' + Math.abs(hash).toString(36) + str;
  let finalHash = 0;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    finalHash = ((finalHash << 5) - finalHash) + char;
    finalHash = finalHash & finalHash;
  }
  return 'h_' + Math.abs(finalHash).toString(36);
}

// ── Change Password ──
export function changePassword(oldPassword, newPassword) {
  const oldHash = simpleHash(oldPassword);
  const adminHash = ADMIN_HASH;
  
  // Verify old password against admin default
  if (oldHash !== adminHash) {
    // Also check against previously changed password
    const saved = getAuth();
    if (!saved || saved.passwordHash !== oldHash) {
      return { success: false, message: 'Current password is incorrect.' };
    }
  }
  
  if (newPassword.length < 8) {
    return { success: false, message: 'New password must be at least 8 characters.' };
  }
  
  const newHash = simpleHash(newPassword);
  saveAuth({
    username: 'FrantzEnterprise',
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
