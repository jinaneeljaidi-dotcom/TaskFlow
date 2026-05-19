// Member management UI — invite by email, display members, remove member

const params = new URLSearchParams(location.search);
const _projectId = params.get('id');

async function loadMembers(containerId) {
  const { data: project } = await api.get(`/projects/${_projectId}`);
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const user = JSON.parse(localStorage.getItem('user'));
  const isOwner = project.owner?._id === user.id || project.owner === user.id;

  (project.members || []).forEach(m => {
    const li = document.createElement('li');
    li.innerHTML = `${m.name || m} (${m.email || ''})
      ${isOwner ? `<button class="danger" onclick="removeMember('${m._id || m}')">Remove</button>` : ''}`;
    container.appendChild(li);
  });
}

async function inviteMember(email) {
  try {
    await api.post(`/projects/${_projectId}/members`, { email });
    alert('Member invited!');
    await loadMembers('members-list');
  } catch (err) {
    alert(err.response?.data?.message || 'Error inviting member');
  }
}

async function removeMember(userId) {
  if (!confirm('Remove this member?')) return;
  try {
    await api.delete(`/projects/${_projectId}/members/${userId}`);
    await loadMembers('members-list');
  } catch (err) {
    alert(err.response?.data?.message || 'Error removing member');
  }
}
