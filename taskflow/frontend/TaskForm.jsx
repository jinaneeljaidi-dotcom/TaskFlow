import { useEffect, useState } from "react";
import axios from "axios";

function TaskForm({ projectId }) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const res = await axios.get(`/api/projects/${projectId}/members`);
      setMembers(res.data);
    };

    fetchMembers();
  }, [projectId]);

  return (
    <form>
      <select name="assignedTo">
        {members.map(m => (
          <option key={m._id} value={m._id}>
            {m.nom} ({m.email})
          </option>
        ))}
      </select>
    </form>
  );
}

export default TaskForm;

