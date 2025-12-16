import { useState } from "react";
import { createTraining } from "../../services/trainings";

export default function CreateTraining() {
  const [form, setForm] = useState({ title: "", description: "", duration: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createTraining(form);
    alert("✅ Formation créée !");
    setForm({ title: "", description: "", duration: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow-md">
      <h2 className="text-xl font-bold mb-3">➕ Ajouter une formation</h2>
      <input type="text" placeholder="Titre" value={form.title}
             onChange={(e)=>setForm({...form,title:e.target.value})}
             className="border p-2 w-full mb-2" required />
      <textarea placeholder="Description" value={form.description}
                onChange={(e)=>setForm({...form,description:e.target.value})}
                className="border p-2 w-full mb-2" />
      <input type="text" placeholder="Durée" value={form.duration}
             onChange={(e)=>setForm({...form,duration:e.target.value})}
             className="border p-2 w-full mb-2" />
      <button className="bg-green-600 text-white px-4 py-2 rounded">Créer</button>
    </form>
  );
}
