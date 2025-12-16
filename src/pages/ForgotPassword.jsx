import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { 
  Mail, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Send,
  Shield,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Veuillez entrer une adresse email valide");
      setLoading(false);
      return;
    }

    try {
      const { data } = await API.post("/auth/forgot-password", { email });
      setMessage(data.message || "Un lien de réinitialisation a été envoyé à votre adresse email");
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        "Une erreur est survenue. Veuillez réessayer ou contacter le support."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmail("");
    setMessage("");
    setError("");
    setSubmitted(false);
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
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 30, repeat: Infinity }}
          className="absolute top-1/2 left-1/4 w-48 h-48 bg-yellow-300 opacity-5 rounded-full blur-3xl"
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
              <HelpCircle className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Mot de passe oublié ?
            </h1>
            <p className="text-indigo-100 text-sm">
              {submitted 
                ? "Vérifiez votre boîte email"
                : "Entrez votre email pour recevoir un lien de réinitialisation"
              }
            </p>
          </div>

          {/* Contenu */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Champ email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          placeholder="votre@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Messages d'erreur */}
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
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Envoyer le lien de réinitialisation
                        </>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center space-y-5"
                >
                  {/* Message de succès */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 text-left">
                      <span className="text-green-800 text-sm block">{message}</span>
                      <span className="text-green-700 text-xs block mt-1">
                        Le lien est valable pendant 1 heure
                      </span>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
                    <h3 className="text-blue-800 text-sm font-semibold mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Prochaines étapes
                    </h3>
                    <ul className="text-blue-700 text-xs space-y-1">
                      <li>• Vérifiez votre boîte de réception</li>
                      <li>• Cliquez sur le lien dans l'email</li>
                      <li>• Créez un nouveau mot de passe sécurisé</li>
                      <li>• Si vous ne voyez pas l'email, vérifiez vos spams</li>
                    </ul>
                  </div>

                  {/* Boutons d'action */}
                  <div className="space-y-3">
                    <button
                      onClick={handleReset}
                      className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 border border-gray-300"
                    >
                      Essayer avec un autre email
                    </button>
                    
                    <div className="text-center text-sm text-gray-600">
                      Vous vous souvenez de votre mot de passe ?{" "}
                      <Link
                        to="/login"
                        className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                      >
                        Se connecter
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lien de retour (visible seulement sur le formulaire) */}
            {!submitted && (
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Retour à la connexion
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Informations de sécurité */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
        >
          <h3 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Sécurité et confidentialité
          </h3>
          <ul className="text-white/80 text-xs space-y-1">
            <li>• Le lien de réinitialisation est valable 1 heure</li>
            <li>• Votre email ne sera pas partagé avec des tiers</li>
            <li>• En cas de problème, contactez le support</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}