import { useState, useEffect } from "react";
import { getUsers, createGroup } from "../../services/chat";
import { X } from "lucide-react";

export default function CreateGroupModal({ onClose, onGroupCreated }) {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    getUsers().then(({ data }) => setUsers(data));
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) return alert("Nom requis");
    const { data } = await createGroup({
      name,
      description,
      memberIds: selected,
    });
    onGroupCreated(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Créer un groupe</h2>
          <button onClick={onClose}>
            <X className="text-gray-500" />
          </button>
        </div>

        <input
          type="text"
          placeholder="Nom du groupe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded w-full mb-2 px-3 py-2"
        />

        <textarea
          placeholder="Description (optionnelle)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded w-full mb-3 px-3 py-2"
        />

        <div className="h-40 overflow-y-auto border rounded p-2 mb-3">
          {users.map((u) => (
            <label key={u.id} className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                checked={selected.includes(u.id)}
                onChange={() => toggleSelect(u.id)}
              />
              <span>{u.name}</span>
            </label>
          ))}
        </div>

        <button
          onClick={handleCreate}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Créer le groupe
        </button>
      </div>
    </div>
  );
}
