const projectId = 'ID_DU_PROJET'; // récupéré depuis l'URL
const DRAFT_KEY  = `draft_${projectId}`;

// Sauvegarde automatique à chaque frappe
document.querySelectorAll('#task-form input, #task-form select, #task-form textarea')
  .forEach(el => {
    el.addEventListener('input', () => {
      const draft = {
        title:    document.getElementById('title').value,
        priority: document.getElementById('priority').value,
        description: document.getElementById('description').value
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    });
  });

// Restauration au chargement
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem(DRAFT_KEY);
  if (!saved) return;
  const ok = confirm('Un brouillon existe. Voulez-vous le restaurer ?');
  if (ok) {
    const draft = JSON.parse(saved);
    document.getElementById('title').value       = draft.title;
    document.getElementById('priority').value    = draft.priority;
    document.getElementById('description').value = draft.description;
  } else {
    localStorage.removeItem(DRAFT_KEY);
  }
});

// Suppression après soumission réussie
document.getElementById('task-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  await axios.post('/api/tasks', { /* champs du form */ });
  localStorage.removeItem(DRAFT_KEY); // supprimer le brouillon
  window.location.reload();
});