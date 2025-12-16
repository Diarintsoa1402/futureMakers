// src/pages/Register.jsx
import React, { useState } from "react";
import API from "../services/api";
import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "child" });
  const [error, setError] = useState(null);
  const { register } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      // Après inscription, demander de vérifier l'email
      window.location.href = "/login?check_email=1";
    } catch (err) {
      setError(err.response?.data?.message || "Erreur");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <h2 className="text-2xl font-bold mb-4">Créer un compte</h2>
      <form onSubmit={submit} className="space-y-3">
        <input required placeholder="Nom" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full p-2 border rounded" />
        <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="w-full p-2 border rounded" />
        <input required type="password" placeholder="Mot de passe" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} className="w-full p-2 border rounded" />
        <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="w-full p-2 border rounded">
          <option value="child">Enfant</option>
          <option value="woman">Femme</option>
          <option value="mentor">Mentor</option>
          <option value="investor">Investisseur</option>
              <option value="admin">Admin</option>
        </select>
        <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded">S'inscrire</button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
}
