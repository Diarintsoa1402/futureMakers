import React, { useState } from "react";
import API from "../services/api";

export default function AvatarSetup() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (file) {
        const formData = new FormData();
        formData.append("avatar", file);
        await API.put("/users/me/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (url) {
        await API.put("/users/me/avatar", { avatarUrl: url });
      } else {
        setError("Veuillez sélectionner un fichier ou saisir une URL d'image");
        setSaving(false);
        return;
      }
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement de l'avatar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Choisir votre avatar</h2>
      <p className="text-gray-600 mb-4">Téléchargez une image depuis votre appareil ou indiquez une URL d'image.</p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Upload local</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ou URL d'image</label>
          <input className="w-full p-2 border rounded" placeholder="https://...jpg" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded">{saving ? "Enregistrement..." : "Continuer"}</button>
      </form>
    </div>
  );
}
