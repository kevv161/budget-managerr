// Simple localStorage-based auth service (development/demo only)

const USERS_KEY = 'bm_users_v1';
const CURRENT_USER_KEY = 'bm_current_user_v1';

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function sanitizeUserForClient(user) {
  if (!user) return null;
  const { email, displayName } = user;
  return { email, displayName };
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function registerUser(email, password, displayName) {
  const users = loadUsers();
  const existing = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
  if (existing) {
    return { success: false, error: 'Email ya registrado' };
  }
  if (!email || !password) {
    return { success: false, error: 'Email y contraseña son requeridos' };
  }
  if (password.length < 6) {
    return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
  }
  const newUser = { email, displayName: displayName || email.split('@')[0], password };
  users.push(newUser);
  saveUsers(users);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sanitizeUserForClient(newUser)));
  return { success: true, user: sanitizeUserForClient(newUser) };
}

export async function loginUser(email, password) {
  const users = loadUsers();
  const user = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user) {
    return { success: false, error: 'Usuario no encontrado' };
  }
  if (user.password !== password) {
    return { success: false, error: 'Credenciales incorrectas' };
  }
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sanitizeUserForClient(user)));
  return { success: true, user: sanitizeUserForClient(user) };
}

export async function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
  return { success: true };
}

