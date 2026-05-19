// Handles login, registration, session restore from localStorage, and logout

function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

function requireAuth() {
  if (!localStorage.getItem('token')) window.location.href = '/index.html';
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}

function renderNav(container) {
  const user = getUser();
  if (!user) return;
  container.innerHTML = `
    <span>TaskFlow</span>
    <div>
      <a href="/dashboard.html">Dashboard</a>
      <a href="/projects.html">Projects</a>
      <span id="notif-bell">🔔<span class="badge" id="notif-count" style="display:none">0</span></span>
      <span style="margin-left:1rem">${user.name}</span>
      <button class="secondary" onclick="logout()" style="margin-left:1rem">Logout</button>
    </div>`;
}

// Init auth page (login + register tabs)
document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect
  if (localStorage.getItem('token') && window.location.pathname.endsWith('index.html')) {
    window.location.href = '/dashboard.html';
    return;
  }

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('msg');
      try {
        const { data } = await api.post('/auth/login', {
          email: loginForm.email.value,
          password: loginForm.password.value,
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard.html';
      } catch (err) {
        msg.textContent = err.response?.data?.message || 'Login failed';
        msg.className = 'error';
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('msg');
      try {
        const { data } = await api.post('/auth/register', {
          name: registerForm.name.value,
          email: registerForm.email.value,
          password: registerForm.password.value,
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard.html';
      } catch (err) {
        msg.textContent = err.response?.data?.message || 'Registration failed';
        msg.className = 'error';
      }
    });
  }
});
