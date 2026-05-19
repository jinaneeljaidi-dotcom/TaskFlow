frontend/taskList.js
async function loadTasks(projectId, page = 1) {
  const status     = document.getElementById('filter-status').value;
  const priority   = document.getElementById('filter-priority').value;
  const search     = document.getElementById('search').value;
  const { data: result } = await axios.get(
    `/api/projects/${projectId}/tasks`,
    { params: { status, priority, search, page } }
  );
  renderTasks(result.data);
  renderPagination(result.totalPages, page, projectId);
}

function renderPagination(totalPages, current, projectId) {
  const div = document.getElementById('pagination');
  div.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    div.innerHTML += `<button onclick="loadTasks('${projectId}',${i})">${i}</button>`;
  }
}