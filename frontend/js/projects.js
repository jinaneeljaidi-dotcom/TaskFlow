// Project list page — create, view, delete projects with pagination

let currentPage = 1;

document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();
  renderNav(document.getElementById('nav'));
  await loadProjects();

  document.getElementById('project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      await api.post('/projects', {
        title: form.title.value,
        description: form.description.value,
        deadline: form.deadline.value || undefined,
        status: form.status.value,
      });
      form.reset();
      await loadProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating project');
    }
  });

  startNotificationPolling();
});

async function loadProjects(page = 1) {
  currentPage = page;
  const { data: res } = await api.get(`/projects?page=${page}&limit=8`);
  const container = document.getElementById('projects-list');
  container.innerHTML = '';
  res.data.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3><a href="/project.html?id=${p._id}">${p.title}</a></h3>
      <p>${p.description || ''}</p>
      <span class="tag">${p.status}</span>
      ${p.deadline ? `<small> · due ${new Date(p.deadline).toLocaleDateString()}</small>` : ''}
      <br><br>
      <button class="danger" onclick="deleteProject('${p._id}')">Delete</button>`;
    container.appendChild(card);
  });
  renderPagination(res.totalPages, page, document.getElementById('pagination'), loadProjects);
}

async function deleteProject(id) {
  if (!confirm('Delete this project and all its tasks?')) return;
  await api.delete(`/projects/${id}`);
  await loadProjects(currentPage);
}

function renderPagination(totalPages, current, container, callback) {
  container.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === current) btn.style.background = '#1d4ed8';
    btn.onclick = () => callback(i);
    container.appendChild(btn);
  }
}
