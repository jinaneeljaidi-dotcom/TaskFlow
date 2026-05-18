// Loads and renders personal dashboard metrics from the server aggregation route

document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();
  renderNav(document.getElementById('nav'));

  try {
    const { data } = await api.get('/dashboard');
    document.getElementById('active-projects').textContent = data.activeProjects;
    document.getElementById('assigned-tasks').textContent = data.assignedTasks;
    document.getElementById('done-tasks').textContent = data.doneTasks;
    document.getElementById('overdue-tasks').textContent = data.overdueTasks;

    const list = document.getElementById('inprogress-list');
    list.innerHTML = '';
    (data.inProgress || []).forEach(t => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${t.title}</strong> — ${t.project?.title || ''} 
        <span class="tag ${t.priority}">${t.priority}</span>
        ${t.deadline ? `<small> due ${new Date(t.deadline).toLocaleDateString()}</small>` : ''}`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }

  startNotificationPolling();
});
