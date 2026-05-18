async function loadActivity(projectId) {
  const { data } = await axios.get(`/api/projects/${projectId}/activities`);
  const list = document.getElementById('activity-feed');
  list.innerHTML = data.map(a => {
    const time = new Date(a.createdAt).toLocaleString('fr-FR');
    return `<li>${a.user.name} — ${a.action} : ${a.details} (${time})</li>`;
  }).join('');
}
loadActivity('PROJECT_ID');