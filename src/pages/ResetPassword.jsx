import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    password: "",
    confirm: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const handlePasswordChange = (value) => {
    setForm(prev => ({ ...prev, password: value }));
    setPasswordStrength(checkPasswordStrength(value));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return "Faible";
    if (passwordStrength <= 3) return "Moyen";
    return "Fort";
  };

  const validateForm = () => {
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return false;
    }

    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas");
      return false;
    }

    if (passwordStrength <= 2) {
      setError("Le mot de passe est trop faible. Utilisez des majuscules, minuscules, chiffres et caractères spéciaux");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data } = await API.post(`/auth/reset-password/${token}`, {
        password: form.password,
      });
      setSuccess(data.message || "Mot de passe réinitialisé avec succès !");
      
      // Redirection automatique après 3 secondes
      setTimeout(() => navigate("/login", { 
        state: { message: "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe" }
      }), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Lien invalide ou expiré. Veuillez demander un nouveau lien de réinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 left-10 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 opacity-10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Carte principale */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Nouveau mot de passe
            </h1>
            <p className="text-indigo-100 text-sm">
              Choisissez un mot de passe sécurisé pour votre compte
            </p>
          </div>

          {/* Formulaire */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Champ mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 caractères"
                    value={form.password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    className="w-full pl-11 pr-11 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Indicateur de force du mot de passe */}
                {form.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Force du mot de passe</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength <= 2 ? "text-red-600" :
                        passwordStrength <= 3 ? "text-yellow-600" : "text-green-600"
                      }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                        transition={{ duration: 0.3 }}
                        className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Champ confirmation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Retapez votre mot de passe"
                    value={form.confirm}
                    onChange={(e) => setForm(prev => ({ ...prev, confirm: e.target.value }))}
                    required
                    className="w-full pl-11 pr-11 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Messages d'erreur/succès */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-red-800 text-sm flex-1">{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-green-800 text-sm block">{success}</span>
                      <span className="text-green-700 text-xs block mt-1">
                        Redirection vers la connexion...
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bouton de soumission */}
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Réinitialisation...
                  </>
                ) : (
                  "Réinitialiser le mot de passe"
                )}
              </motion.button>
            </form>

            {/* Lien de retour */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>

        {/* Conseils de sécurité */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
        >
          <h3 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Conseils de sécurité
          </h3>
          <ul className="text-white/80 text-xs space-y-1">
            <li>• Utilisez au moins 8 caractères</li>
            <li>• Combinez lettres, chiffres et symboles</li>
            <li>• Évitez les mots de passe courants</li>
            <li>• Ne réutilisez pas d'anciens mots de passe</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}