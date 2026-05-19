// ═══════════════════════════════════════════════════════════
//  TaskFlow — app.js
//  Fonctionnalités : auth, projets, tâches, dashboard,
//  membres, activités, notifications, filtrage, brouillons
// ═══════════════════════════════════════════════════════════

const API = 'http://localhost:5000/api';

// ── Axios defaults ────────────────────────────────────────
const restoreToken = () => {
  const token = localStorage.getItem('tf_token');
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};
restoreToken();

// ── State ────────────────────────────────────────────────
let currentUser    = null;
let currentProject = null;
let tasksPage      = 1;
let projectsPage   = 1;
let pollInterval   = null;

// ── Helpers ───────────────────────────────────────────────
const $ = id => document.getElementById(id);
const show  = id => $(`view-${id}`).classList.add('active');
const hide  = id => $(`view-${id}`).classList.remove('active');
const setView = id => {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  show(id);
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.view === id);
  });
  $('topbar-title').textContent =
    id === 'dashboard' ? 'Tableau de bord' :
    id === 'projects'  ? 'Projets' : '';
};

const timeAgo = date => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'à l\'instant';
  if (s < 3600) return `il y a ${Math.floor(s/60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s/3600)} h`;
  return `il y a ${Math.floor(s/86400)} j`;
};

const statusChip = s => {
  const map = { 'à faire': 'todo', 'en cours': 'inprogress', 'terminé': 'done' };
  return `<span class="chip chip-${map[s] || 'todo'}">${s}</span>`;
};
const priorityChip = p => `<span class="chip chip-${p}">${p}</span>`;

// ═══════════════════════════════════════════════════════════
//  AUTH  (Fonctionnalité 1)
// ═══════════════════════════════════════════════════════════
document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn[data-tab]').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    btn.classList.add('active');
    $(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

const saveSession = (token, user) => {
  localStorage.setItem('tf_token', token);
  localStorage.setItem('tf_user', JSON.stringify(user));
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  currentUser = user;
};

const launchApp = () => {
  $('auth-page').classList.remove('active');
  $('app-page').classList.add('active');
  $('user-chip').textContent = currentUser.fullName;
  loadDashboard();
  startPolling();
};

// Auto-restore session
const savedUser = localStorage.getItem('tf_user');
const savedToken = localStorage.getItem('tf_token');
if (savedToken && savedUser) {
  currentUser = JSON.parse(savedUser);
  launchApp();
} else {
  $('auth-page').classList.add('active');
}

$('btn-login').addEventListener('click', async () => {
  $('login-error').textContent = '';
  try {
    const { data } = await axios.post(`${API}/auth/login`, {
      email: $('login-email').value.trim(),
      password: $('login-password').value
    });
    saveSession(data.token, data.user);
    launchApp();
  } catch (e) {
    $('login-error').textContent = e.response?.data?.message || 'Erreur de connexion';
  }
});

$('btn-register').addEventListener('click', async () => {
  $('register-error').textContent = '';
  try {
    const { data } = await axios.post(`${API}/auth/register`, {
      fullName: $('reg-name').value.trim(),
      email: $('reg-email').value.trim(),
      password: $('reg-password').value
    });
    saveSession(data.token, data.user);
    launchApp();
  } catch (e) {
    $('register-error').textContent = e.response?.data?.message || 'Erreur d\'inscription';
  }
});

$('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('tf_token');
  localStorage.removeItem('tf_user');
  clearInterval(pollInterval);
  location.reload();
});

// ═══════════════════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════════════════
document.querySelectorAll('.nav-link[data-view]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const v = link.dataset.view;
    setView(v);
    if (v === 'dashboard') loadDashboard();
    if (v === 'projects')  loadProjects();
  });
});

// ═══════════════════════════════════════════════════════════
//  DASHBOARD  (Fonctionnalité 5)
// ═══════════════════════════════════════════════════════════
const loadDashboard = async () => {
  try {
    const { data } = await axios.get(`${API}/dashboard`);
    $('stats-grid').innerHTML = [
      { label: 'Projets actifs',   value: data.activeProjects,  color: '#47ff9a' },
      { label: 'Tâches assignées', value: data.assignedTasks,   color: '#47c8ff' },
      { label: 'Tâches terminées', value: data.completedTasks,  color: '#e8ff47' },
      { label: 'Tâches en retard', value: data.lateTasks,       color: '#ff4d4d' }
    ].map(s => `
      <div class="stat-card">
        <div class="stat-label">${s.label}</div>
        <div class="stat-value" style="color:${s.color}">${s.value}</div>
      </div>
    `).join('');

    const el = $('in-progress-tasks');
    if (!data.inProgressTasks.length) {
      el.innerHTML = '<div class="empty-state">Aucune tâche en cours 🎉</div>';
      return;
    }
    el.innerHTML = `<div class="task-list">${data.inProgressTasks.map(t => `
      <div class="task-row">
        <div class="task-row-title">${t.title}</div>
        <div class="task-row-meta">
          ${priorityChip(t.priority)}
          <span style="font-size:.8rem;color:var(--muted)">${t.project?.title || ''}</span>
        </div>
      </div>
    `).join('')}</div>`;
  } catch (e) { console.error(e); }
};

// ═══════════════════════════════════════════════════════════
//  PROJECTS  (Fonctionnalité 2)
// ═══════════════════════════════════════════════════════════
const loadProjects = async (page = 1) => {
  projectsPage = page;
  try {
    const { data } = await axios.get(`${API}/projects?page=${page}&limit=9`);
    const el = $('projects-list');
    if (!data.data.length) {
      el.innerHTML = '<div class="empty-state">Aucun projet. Créez-en un !</div>';
    } else {
      el.innerHTML = data.data.map(p => {
        const isOwner = p.owner._id === currentUser.id || p.owner === currentUser.id;
        return `
        <div class="project-card" data-id="${p._id}">
          <div class="project-card-title">${p.title}</div>
          <div class="project-card-desc">${p.description || 'Aucune description'}</div>
          <div class="project-card-footer">
            <span class="chip chip-${p.status.replace(' ','')}">${p.status}</span>
            <div class="project-actions" onclick="event.stopPropagation()">
              ${isOwner ? `
                <button class="btn-icon" onclick="openEditProject('${p._id}','${p.title.replace(/'/g,"\\'")}','${(p.description||'').replace(/'/g,"\\'")}','${p.status}')">✏️</button>
                <button class="btn-icon danger" onclick="deleteProject('${p._id}')">🗑</button>
              ` : ''}
            </div>
          </div>
        </div>`;
      }).join('');
      el.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => openProjectDetail(card.dataset.id));
      });
    }
    renderPagination('projects-pagination', data.page, data.totalPages, loadProjects);
  } catch (e) { console.error(e); }
};

$('btn-new-project').addEventListener('click', () => openNewProject());

let editingProjectId = null;
const openNewProject = () => {
  editingProjectId = null;
  $('modal-project-title').textContent = 'Nouveau projet';
  $('proj-title').value = '';
  $('proj-desc').value = '';
  $('proj-deadline').value = '';
  $('proj-status').value = 'actif';
  openModal('modal-project');
};
window.openEditProject = (id, title, desc, status) => {
  editingProjectId = id;
  $('modal-project-title').textContent = 'Modifier le projet';
  $('proj-title').value = title;
  $('proj-desc').value = desc;
  $('proj-status').value = status;
  openModal('modal-project');
};
window.deleteProject = async (id) => {
  if (!confirm('Supprimer ce projet ? Toutes les tâches seront supprimées.')) return;
  try {
    await axios.delete(`${API}/projects/${id}`);
    loadProjects(projectsPage);
  } catch (e) { alert(e.response?.data?.message || 'Erreur'); }
};

$('btn-save-project').addEventListener('click', async () => {
  const payload = {
    title: $('proj-title').value.trim(),
    description: $('proj-desc').value.trim(),
    deadline: $('proj-deadline').value || null,
    status: $('proj-status').value
  };
  if (!payload.title) return alert('Titre obligatoire');
  try {
    if (editingProjectId) {
      await axios.put(`${API}/projects/${editingProjectId}`, payload);
    } else {
      await axios.post(`${API}/projects`, payload);
    }
    closeModal();
    loadProjects(projectsPage);
  } catch (e) { alert(e.response?.data?.message || 'Erreur'); }
});
$('btn-cancel-project').addEventListener('click', closeModal);

// ═══════════════════════════════════════════════════════════
//  PROJECT DETAIL
// ═══════════════════════════════════════════════════════════
const openProjectDetail = async (id) => {
  currentProject = id;
  setView('project-detail');
  $('topbar-title').textContent = 'Projet';

  // Tabs
  document.querySelectorAll('.tab-btn[data-ptab]').forEach(btn => {
    btn.classList.remove('active');
    $(`ptab-${btn.dataset.ptab}`).classList.remove('active');
  });
  document.querySelector('.tab-btn[data-ptab="tasks"]').classList.add('active');
  $('ptab-tasks').classList.add('active');

  // Header
  try {
    const { data } = await axios.get(`${API}/projects?page=1&limit=100`);
    const p = data.data.find(x => x._id === id);
    if (p) {
      $('project-detail-header').innerHTML = `
        <div class="project-detail-title">${p.title}</div>
        <div style="color:var(--muted);font-size:.9rem;margin-top:.2rem">${p.description || ''}</div>
      `;
    }
  } catch(e){}

  loadTasks();
};

$('btn-back-projects').addEventListener('click', () => {
  setView('projects');
  loadProjects(projectsPage);
});

document.querySelectorAll('.tab-btn[data-ptab]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn[data-ptab]').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.ptab').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    $(`ptab-${btn.dataset.ptab}`).classList.add('active');
    if (btn.dataset.ptab === 'members')   loadMembers();
    if (btn.dataset.ptab === 'activities') loadActivities();
  });
});

// ═══════════════════════════════════════════════════════════
//  TASKS  (Fonctionnalités 3, 4, 6)
// ═══════════════════════════════════════════════════════════
const loadTasks = async (page = 1) => {
  tasksPage = page;
  const search   = $('task-search').value.trim();
  const status   = $('filter-status').value;
  const priority = $('filter-priority').value;
  const params   = new URLSearchParams({ page, limit: 20 });
  if (search)   params.set('search', search);
  if (status)   params.set('status', status);
  if (priority) params.set('priority', priority);

  try {
    const { data } = await axios.get(`${API}/tasks/projects/${currentProject}/tasks?${params}`);
    const el = $('tasks-list');
    if (!data.data.length) {
      el.innerHTML = '<div class="empty-state">Aucune tâche pour ces filtres.</div>';
    } else {
      el.innerHTML = `<div class="task-list">${data.data.map(t => `
        <div class="task-row">
          <div class="task-row-title">${t.title}</div>
          <div class="task-row-meta">
            ${priorityChip(t.priority)}
            <select class="task-status-select" data-id="${t._id}" onchange="updateTaskStatus('${t._id}', this.value)">
              <option ${t.status==='à faire'?'selected':''}>à faire</option>
              <option ${t.status==='en cours'?'selected':''}>en cours</option>
              <option ${t.status==='terminé'?'selected':''}>terminé</option>
            </select>
            ${t.assignedTo ? `<span style="font-size:.8rem;color:var(--accent2)">${t.assignedTo.fullName}</span>` : ''}
            <button class="btn-icon danger" onclick="deleteTask('${t._id}')">🗑</button>
          </div>
        </div>
      `).join('')}</div>`;
    }
    renderPagination('tasks-pagination', data.page, data.totalPages, loadTasks);
  } catch (e) { console.error(e); }
};

// Debounced search/filter
['task-search','filter-status','filter-priority'].forEach(id => {
  $(id).addEventListener('input', () => loadTasks(1));
  $(id).addEventListener('change', () => loadTasks(1));
});

window.updateTaskStatus = async (id, status) => {
  try {
    await axios.patch(`${API}/tasks/${id}/status`, { status });
    loadDashboard();
  } catch (e) { alert(e.response?.data?.message || 'Erreur'); loadTasks(tasksPage); }
};
window.deleteTask = async (id) => {
  if (!confirm('Supprimer cette tâche ?')) return;
  try {
    await axios.delete(`${API}/tasks/${id}`);
    loadTasks(tasksPage);
  } catch (e) { alert(e.response?.data?.message || 'Erreur'); }
};

// Task modal  (Fonctionnalité 7 — brouillons LocalStorage)
$('btn-new-task').addEventListener('click', async () => {
  $('modal-task-title').textContent = 'Nouvelle tâche';
  $('task-title').value = '';
  $('task-desc').value = '';
  $('task-priority').value = 'basse';
  $('task-status').value = 'à faire';
  $('task-deadline').value = '';

  // Charger les membres pour le menu d'assignation
  await populateAssigneeSelect();

  // Vérifier brouillon (Fonctionnalité 7)
  const draftKey = `tf_draft_${currentProject}`;
  const draft = localStorage.getItem(draftKey);
  if (draft) {
    $('draft-banner').classList.remove('hidden');
  } else {
    $('draft-banner').classList.add('hidden');
  }
  openModal('modal-task');
  attachDraftListeners(draftKey);
});

const attachDraftListeners = (key) => {
  const fields = ['task-title','task-desc','task-priority','task-status','task-deadline'];
  fields.forEach(id => {
    $(id).oninput = () => {
      const d = {};
      fields.forEach(f => d[f] = $(f).value);
      localStorage.setItem(key, JSON.stringify(d));
    };
  });
};

$('restore-draft').addEventListener('click', (e) => {
  e.preventDefault();
  const draft = JSON.parse(localStorage.getItem(`tf_draft_${currentProject}`) || '{}');
  if (draft['task-title'])    $('task-title').value    = draft['task-title'];
  if (draft['task-desc'])     $('task-desc').value     = draft['task-desc'];
  if (draft['task-priority']) $('task-priority').value = draft['task-priority'];
  if (draft['task-status'])   $('task-status').value   = draft['task-status'];
  if (draft['task-deadline']) $('task-deadline').value = draft['task-deadline'];
  $('draft-banner').classList.add('hidden');
});
$('discard-draft').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem(`tf_draft_${currentProject}`);
  $('draft-banner').classList.add('hidden');
});

const populateAssigneeSelect = async () => {
  try {
    const { data } = await axios.get(`${API}/projects?page=1&limit=100`);
    const p = data.data.find(x => x._id === currentProject);
    const sel = $('task-assignee');
    sel.innerHTML = '<option value="">— Non assigné —</option>';
    if (p) {
      const members = [p.owner, ...(p.members || [])];
      members.forEach(m => {
        const id = m._id || m;
        const name = m.fullName || 'Membre';
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = name;
        sel.appendChild(opt);
      });
    }
  } catch(e){}
};

$('btn-save-task').addEventListener('click', async () => {
  const payload = {
    title:      $('task-title').value.trim(),
    description: $('task-desc').value.trim(),
    priority:   $('task-priority').value,
    status:     $('task-status').value,
    deadline:   $('task-deadline').value || null,
    project:    currentProject,
    assignedTo: $('task-assignee').value || null
  };
  if (!payload.title) return alert('Titre obligatoire');
  try {
    await axios.post(`${API}/tasks`, payload);
    // Supprimer brouillon après succès
    localStorage.removeItem(`tf_draft_${currentProject}`);
    closeModal();
    loadTasks(tasksPage);
  } catch (e) { alert(e.response?.data?.message || 'Erreur'); }
});
$('btn-cancel-task').addEventListener('click', closeModal);

// ═══════════════════════════════════════════════════════════
//  MEMBERS  (Fonctionnalité 8)
// ═══════════════════════════════════════════════════════════
const loadMembers = async () => {
  try {
    const { data } = await axios.get(`${API}/projects?page=1&limit=100`);
    const p = data.data.find(x => x._id === currentProject);
    if (!p) return;
    const list = $('members-list');
    const isOwner = (p.owner._id || p.owner) === currentUser.id;
    list.innerHTML = p.members.map(m => `
      <li class="member-item">
        <div>
          <div class="member-info">${m.fullName || m}</div>
          <div class="member-email">${m.email || ''}</div>
        </div>
        ${isOwner ? `<button class="btn-icon danger" onclick="removeMember('${m._id || m}')">Retirer</button>` : ''}
      </li>
    `).join('') || '<li style="color:var(--muted);padding:.5rem">Aucun membre</li>';
  } catch(e){}
};

$('btn-invite').addEventListener('click', async () => {
  const email = $('invite-email').value.trim();
  if (!email) return;
  try {
    await axios.post(`${API}/projects/${currentProject}/members`, { email });
    $('invite-email').value = '';
    loadMembers();
  } catch (e) { alert(e.response?.data?.message || 'Erreur'); }
});

window.removeMember = async (userId) => {
  try {
    await axios.delete(`${API}/projects/${currentProject}/members/${userId}`);
    loadMembers();
  } catch (e) { alert(e.response?.data?.message || 'Erreur'); }
};

// ═══════════════════════════════════════════════════════════
//  ACTIVITIES  (Fonctionnalité 9)
// ═══════════════════════════════════════════════════════════
const activityLabels = {
  task_created:       (m) => `a créé la tâche « ${m.taskTitle} »`,
  task_deleted:       (m) => `a supprimé la tâche « ${m.taskTitle} »`,
  task_status_changed:(m) => `a changé le statut de « ${m.taskTitle} » : ${m.from} → ${m.to}`,
  member_added:       (m) => `a ajouté ${m.memberEmail}`,
  member_removed:     (m) => `a retiré un membre`,
  project_updated:    (m) => `a modifié le projet`
};

const loadActivities = async () => {
  try {
    const { data } = await axios.get(`${API}/projects/${currentProject}/activities`);
    const el = $('activity-feed');
    if (!data.length) {
      el.innerHTML = '<div class="empty-state">Aucune activité enregistrée.</div>';
      return;
    }
    el.innerHTML = data.map(a => {
      const fn = activityLabels[a.type] || (() => a.type);
      const label = fn(a.meta || {});
      return `
        <li class="activity-item">
          <div class="activity-dot"></div>
          <div class="activity-text"><strong>${a.user?.fullName || 'Utilisateur'}</strong> ${label}</div>
          <div class="activity-time">${timeAgo(a.createdAt)}</div>
        </li>`;
    }).join('');
  } catch(e){}
};

// ═══════════════════════════════════════════════════════════
//  NOTIFICATIONS  (Fonctionnalité 10)
// ═══════════════════════════════════════════════════════════
let notifMemory = [];

const loadNotifications = async () => {
  try {
    const { data } = await axios.get(`${API}/notifications`);
    notifMemory = data;

    // Archiver les lues dans localStorage
    const read = data.filter(n => n.read);
    localStorage.setItem('tf_read_notifs', JSON.stringify(read));

    const unread = data.filter(n => !n.read);
    const badge = $('notif-badge');
    if (unread.length) {
      badge.textContent = unread.length;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }

    renderNotifPanel(data);
  } catch(e){}
};

const renderNotifPanel = (notifs) => {
  const el = $('notif-list');
  if (!notifs.length) {
    el.innerHTML = '<li style="color:var(--muted);font-size:.85rem">Aucune notification</li>';
    return;
  }
  el.innerHTML = notifs.slice(0, 20).map(n => `
    <li class="notif-item ${n.read ? '' : 'unread'}">
      <span class="notif-msg">${n.message}</span>
      ${!n.read ? `<button class="notif-read-btn" onclick="markRead('${n._id}')">Lu</button>` : ''}
    </li>
  `).join('');
};

window.markRead = async (id) => {
  try {
    await axios.patch(`${API}/notifications/${id}/read`);
    loadNotifications();
  } catch(e){}
};

$('notif-btn').addEventListener('click', () => {
  $('notif-panel').classList.toggle('hidden');
});
document.addEventListener('click', (e) => {
  if (!$('notif-panel').contains(e.target) && e.target !== $('notif-btn')) {
    $('notif-panel').classList.add('hidden');
  }
});

// Polling toutes les 30 secondes
const startPolling = () => {
  loadNotifications();
  pollInterval = setInterval(loadNotifications, 30000);
};

// ═══════════════════════════════════════════════════════════
//  MODAL UTILS
// ═══════════════════════════════════════════════════════════
const openModal = (id) => {
  $('modal-overlay').classList.remove('hidden');
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
  $(id).classList.remove('hidden');
};
const closeModal = () => {
  $('modal-overlay').classList.add('hidden');
};
$('modal-overlay').addEventListener('click', (e) => {
  if (e.target === $('modal-overlay')) closeModal();
});

// ═══════════════════════════════════════════════════════════
//  PAGINATION
// ═══════════════════════════════════════════════════════════
const renderPagination = (elId, current, total, cb) => {
  const el = $(elId);
  if (total <= 1) { el.innerHTML = ''; return; }
  let html = '';
  for (let i = 1; i <= total; i++) {
    html += `<button class="page-btn ${i===current?'active':''}" onclick="(${cb})(${i})">${i}</button>`;
  }
  el.innerHTML = html;
};
