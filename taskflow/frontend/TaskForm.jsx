import { useEffect, useState } from "react";
import axios from "axios";

function TaskForm({ projectId }) {
  const [members, setMembers] = useState([]);
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(`/api/projects/${projectId}/members`);
        setMembers(res.data);
      } catch (err) {
        console.error("Erreur chargement membres", err);
      }
    };

    fetchMembers();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`/api/tasks`, {
        title,
        projectId,
        assignedTo,
      });

      alert("Task créée !");
    } catch (err) {
      console.error("Erreur création task", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      
      <input
        type="text"
        placeholder="Titre de la tâche"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <select
        name="assignedTo"
        value={assignedTo}
        onChange={(e) => setAssignedTo(e.target.value)}
      >
        <option value="">-- Choisir un membre --</option>

        {members.map((m) => (
          <option key={m._id} value={m._id}>
            {m.nom} ({m.email})
          </option>
        ))}
      </select>

      <button type="submit">
        Créer tâche
      </button>
    </form>
  );
}


