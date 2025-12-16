import { useEffect, useState } from "react";
import { getProfile, updateProfile, deleteProfile } from "../services/profile";
import { useAuth } from "../hooks/useAuth";
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Shield,
  Download,
  Camera,
  Bell,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function AvatarEditor({ user, onUpdated, setMessage }) {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try {
      setSaving(true);
      if (file) {
        const fd = new FormData();
        fd.append("avatar", file);
        const { default: API } = await import("../services/api");
        const { data } = await API.put("/users/me/avatar", fd, { headers: { "Content-Type": "multipart/form-data" } });
        onUpdated(data.user);
        setMessage({ text: "Avatar mis à jour ✅", type: "success" });
      } else if (url) {
        const { default: API } = await import("../services/api");
        const { data } = await API.put("/users/me/avatar", { avatarUrl: url });
        onUpdated(data.user);
        setMessage({ text: "Avatar mis à jour ✅", type: "success" });
      } else {
        setMessage({ text: "Veuillez choisir un fichier ou saisir une URL", type: "error" });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de la mise à jour de l'avatar";
      setMessage({ text: msg, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const preview = file ? URL.createObjectURL(file) : (url || user.avatarUrl || null);

  return (
    <div className="border rounded-xl p-4 bg-gray-50">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">Aperçu</div>
          )}
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Upload local</label>
            <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ou URL d'image</label>
            <input className="w-full p-2 border rounded" placeholder="https://...jpg" value={url} onChange={(e)=>setUrl(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <button disabled={saving} onClick={save} type="button" className="px-4 py-2 bg-indigo-600 text-white rounded">
              {saving ? "Enregistrement..." : "Mettre à jour l'avatar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "",
    currentPassword: "" 
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await getProfile();
        setUser(data);
        setForm({ 
          name: data.name, 
          email: data.email, 
          password: "",
          currentPassword: "" 
        });
      } catch (err) {
        console.error("Erreur chargement profil:", err);
        setMessage({ 
          text: "Erreur lors du chargement du profil", 
          type: "error" 
        });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear message when user starts typing
    if (message.text) setMessage({ text: "", type: "" });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    // Validate form
    if (!form.name.trim() || !form.email.trim()) {
      setMessage({ 
        text: "Le nom et l'email sont obligatoires", 
        type: "error" 
      });
      setUpdating(false);
      return;
    }

    try {
      await updateProfile(form);
      setMessage({ 
        text: "Profil mis à jour avec succès ✅", 
        type: "success" 
      });
      // Update local user state
      setUser(prev => ({ ...prev, name: form.name, email: form.email }));
      // Clear password fields
      setForm(prev => ({ ...prev, password: "", currentPassword: "" }));
    } catch (err) {
      console.error(err);
      setMessage({ 
        text: err.response?.data?.message || "Erreur lors de la mise à jour ❌", 
        type: "error" 
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) return;
    
    try {
      await deleteProfile();
      localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setMessage({ 
        text: "Erreur lors de la suppression du compte ❌", 
        type: "error" 
      });
    }
  };

  const exportData = () => {
    const data = {
      profile: user,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `futuremakers-profile-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "security", label: "Sécurité", icon: Shield },
    { id: "preferences", label: "Préférences", icon: Bell },
  ];

  const roleColors = {
    child: "bg-blue-100 text-blue-800",
    woman: "bg-pink-100 text-pink-800",
    mentor: "bg-purple-100 text-purple-800",
    investor: "bg-green-100 text-green-800",
    admin: "bg-orange-100 text-orange-800"
  };

  const roleLabels = {
    child: "Enfant",
    woman: "Femme Entrepreneure",
    mentor: "Mentor",
    investor: "Investisseur",
    admin: "Administrateur"
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover border" />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[user.role]}`}>
                    {roleLabels[user.role]}
                  </span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:border-gray-400 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exporter mes données
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        activeTab === tab.id
                          ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl shadow-sm p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Informations personnelles
                  </h2>

                  <AnimatePresence>
                    {message.text && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
                          message.type === "success" 
                            ? "bg-green-50 text-green-800 border border-green-200" 
                            : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                      >
                        {message.type === "success" ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <AlertCircle className="w-5 h-5" />
                        )}
                        {message.text}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3">Avatar</h3>
                    <AvatarEditor user={user} onUpdated={(u)=>setUser(u)} setMessage={setMessage} />
                  </div>

                  <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom complet
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                            placeholder="Votre nom complet"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Adresse email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                            placeholder="votre@email.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={updating}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-5 h-5" />
                        {updating ? "Mise à jour..." : "Sauvegarder"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl shadow-sm p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Sécurité du compte
                  </h2>

                  <form onSubmit={handleUpdate} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={form.currentPassword}
                          onChange={handleChange}
                          className="w-full pl-11 pr-11 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                          placeholder="Votre mot de passe actuel"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          className="w-full pl-11 pr-11 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                          placeholder="Laissez vide pour ne pas changer"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Minimum 8 caractères avec des chiffres et lettres
                      </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={updating}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-5 h-5" />
                        {updating ? "Mise à jour..." : "Changer le mot de passe"}
                      </button>
                    </div>
                  </form>

                  {/* Danger Zone */}
                  <div className="border-t border-gray-200 mt-8 pt-8">
                    <h3 className="text-lg font-semibold text-red-600 mb-4">
                      Zone dangereuse
                    </h3>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-red-800 mb-4">
                        La suppression de votre compte est irréversible. Toutes vos données seront perdues.
                      </p>
                      <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer mon compte
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "preferences" && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl shadow-sm p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Préférences
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div>
                        <h4 className="font-medium text-gray-900">Notifications email</h4>
                        <p className="text-sm text-gray-500">Recevoir les actualités et rappels</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div>
                        <h4 className="font-medium text-gray-900">Langue</h4>
                        <p className="text-sm text-gray-500">Langue de l'interface</p>
                      </div>
                      <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <option>Français</option>
                        <option>English</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}