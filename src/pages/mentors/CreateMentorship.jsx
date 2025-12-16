// src/Pages/mentors/CreateMentorship.js
import { useState } from "react";
import { createMentorship } from "../../services/mentorship";

export default function CreateMentorship() {
  const [form, setForm] = useState({
    womanId: "",
    projectId: "",
    topic: "",
    date: "",
    status: "Planifié",
    notes: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createMentorship(form);
    alert("✅ Session mentorat créée !");
    setForm({ womanId: "", projectId: "", topic: "", date: "", status: "Planifié", notes: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow-md">
      <h2 className="text-xl font-bold mb-3">➕ Planifier une session</h2>

      <input type="text" placeholder="ID Femme"
        value={form.womanId}
        onChange={(e) => setForm({ ...form, womanId: e.target.value })}
        className="border p-2 w-full mb-2" />

      <input type="text" placeholder="ID Projet"
        value={form.projectId}
        onChange={(e) => setForm({ ...form, projectId: e.target.value })}
        className="border p-2 w-full mb-2" />

      <input type="text" placeholder="Sujet"
        value={form.topic}
        onChange={(e) => setForm({ ...form, topic: e.target.value })}
        className="border p-2 w-full mb-2" />

      <input type="date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        className="border p-2 w-full mb-2" />

      <textarea placeholder="Notes"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
        className="border p-2 w-full mb-2" />

      <select value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
        className="border p-2 w-full mb-2">
        <option value="Planifié">Planifié</option>
        <option value="En cours">En cours</option>
        <option value="Terminé">Terminé</option>
      </select>

      <button className="bg-purple-600 text-white px-4 py-2 rounded">Créer</button>
    </form>
  );
}
