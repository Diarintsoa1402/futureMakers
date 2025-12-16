import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Rocket, 
  Mail, 
  Shield,
  ArrowRight,
  Home,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VerifyChild() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyChild = async () => {
      try {
        const { data } = await API.get(`/auth/verify-child/${token}`);
        setStatus("success");
        setMessage(
          data.message || "Le compte de l'enfant a été validé avec succès !"
        );
        
        // Compte à rebours pour la redirection
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              navigate("/login", {
                state: { 
                  message: "Le compte enfant a été validé ! Vous pouvez maintenant vous connecter." 
                }
              });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Lien invalide ou expiré. Veuillez contacter le support."
        );
      }
    };

    if (token) verifyChild();
  }, [token, navigate]);

  const handleManualRedirect = () => {
    navigate("/login", {
      state: { 
        message: "Le compte enfant a été validé ! Vous pouvez maintenant vous connecter." 
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
            y: [0, 15, 0]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-48 h-48 bg-blue-200 opacity-20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, -15, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-200 opacity-20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Validation du compte enfant
            </h1>
            <p className="text-blue-100 text-sm">
              Sécurisation de l'accès à Future Markers
            </p>
          </div>

          {/* Contenu */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {status === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center space-y-6"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 mx-auto"
                  >
                    <Loader2 className="w-16 h-16 text-indigo-600" />
                  </motion.div>
                  
                  <div className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Vérification en cours
                    </h2>
                    <p className="text-gray-600">
                      Validation de la création du compte enfant...
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
                    <h3 className="text-blue-800 text-sm font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Pourquoi cette vérification ?
                    </h3>
                    <ul className="text-blue-700 text-xs space-y-1">
                      <li>• Protection de la vie privée des enfants</li>
                      <li>• Consentement parental obligatoire</li>
                      <li>• Environnement d'apprentissage sécurisé</li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {status === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="text-center space-y-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                  >
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </motion.div>

                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-green-700">
                      Compte validé avec succès !
                    </h2>
                    <p className="text-gray-600 text-lg">
                      {message}
                    </p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-center gap-3 text-green-800">
                      <Rocket className="w-5 h-5" />
                      <span className="font-semibold">
                        Prêt pour l'aventure Future Markers !
                      </span>
                    </div>
                  </motion.div>

                  {/* Compte à rebours */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="space-y-4"
                  >
                    <div className="text-gray-500 text-sm">
                      Redirection automatique dans{" "}
                      <span className="font-mono font-bold text-indigo-600 text-lg">
                        {countdown}
                      </span>{" "}
                      seconde{countdown !== 1 ? "s" : ""}
                    </div>

                    <button
                      onClick={handleManualRedirect}
                      className="flex items-center gap-2 mx-auto px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      Se connecter maintenant
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                </motion.div>
              )}

              {status === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="text-center space-y-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto"
                  >
                    <XCircle className="w-12 h-12 text-red-600" />
                  </motion.div>

                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-red-700">
                      Échec de la validation
                    </h2>
                    <p className="text-gray-600">
                      {message}
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left">
                    <h3 className="text-red-800 text-sm font-semibold mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Que faire maintenant ?
                    </h3>
                    <ul className="text-red-700 text-xs space-y-1">
                      <li>• Vérifiez que le lien n'a pas expiré</li>
                      <li>• Contactez le support Future Markers</li>
                      <li>• Redemandez une invitation par email</li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      to="/contact"
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      <Mail className="w-4 h-4" />
                      Contacter le support
                    </Link>
                    
                    <Link
                      to="/"
                      className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all border border-gray-300"
                    >
                      <Home className="w-4 h-4" />
                      Retour à l'accueil
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center text-gray-600 text-sm"
        >
          <p>
            Future Markers - Plateforme d'apprentissage sécurisée pour les enfants
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}