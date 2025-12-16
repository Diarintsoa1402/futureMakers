import React, { useState, useRef, useCallback, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, UserCircle, Star, Heart, Users, Rocket, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

/* --- Sous-composants optimisés --- */

function Alert({ message, color }) {
  const bg = color === "red" ? "bg-red-50" : "bg-green-50";
  const border = color === "red" ? "border-red-200" : "border-green-200";
  const text = color === "red" ? "text-red-600" : "text-green-600";
  const Icon = color === "red" ? AlertCircle : CheckCircle;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${bg} ${border} ${text} p-3 rounded-xl text-sm border flex items-start gap-3`}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <span className="flex-1">{message}</span>
    </motion.div>
  );
}

function OAuthButton({ label, color, icon, onClick, disabled }) {
  const bgColor = color === "white" ? "bg-white border border-gray-300" : "bg-[#1877F2]";
  const textColorClass = color === "white" ? "text-gray-700" : "text-white";
  const hoverColor = color === "white" ? "hover:bg-gray-50 hover:border-gray-400" : "hover:bg-[#166FE5]";
  
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.99 }}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center gap-3 ${bgColor} ${textColorClass} px-4 py-3 rounded-xl ${hoverColor} transition-all duration-200 font-medium ${
        disabled ? "opacity-50 cursor-not-allowed" : "shadow-sm hover:shadow"
      }`}
      aria-label={label}
    >
      {icon === "google" && (
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      )}
      {icon === "facebook" && (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )}
      {label}
    </motion.button>
  );
}

function PasswordInput({ value, onChange, placeholder, required = true, disabled = false, id = "password" }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" aria-hidden="true" />
      <input
        id={id}
        required={required}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full pl-11 pr-11 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
        aria-label={placeholder}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:text-gray-600"
        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        tabIndex={0}
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}

export default function AuthPage() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "child",
    parentEmail: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const { login, register } = useAuth();

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleRecaptchaChange = useCallback((token) => {
    setRecaptchaToken(token);
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const resetRecaptcha = useCallback(() => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
    setRecaptchaToken(null);
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!recaptchaToken) {
      setError("Veuillez valider le reCAPTCHA");
      return;
    }

    setLoading(true);

    try {
      const { user } = await login(loginForm.email, loginForm.password, recaptchaToken);
      // Si pas d'avatar, rediriger vers setup
      if (!user?.avatarUrl) {
        window.location.href = "/avatar-setup";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      if (err.response?.data?.code === "email_not_verified") {
        setError("Votre email n'est pas vérifié. Veuillez vérifier votre boîte de réception ou renvoyer le mail.");
      } else {
        setError(err.response?.data?.message || "Erreur de connexion. Vérifiez vos identifiants.");
      }
      resetRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!recaptchaToken) {
      setError("Veuillez valider le reCAPTCHA");
      return;
    }

    if (registerForm.role === "child" && !registerForm.parentEmail) {
      setError("L'email du parent est obligatoire pour les comptes enfants");
      return;
    }

    if (registerForm.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    // Validation email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email)) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }

    if (registerForm.role === "child" && !emailRegex.test(registerForm.parentEmail)) {
      setError("Veuillez entrer une adresse email valide pour le parent");
      return;
    }

    setLoading(true);

    try {
      await register({ ...registerForm, recaptchaToken });

      if (registerForm.role === "child") {
        setSuccess(
          "Un email de validation a été envoyé au parent. Vous pourrez vous connecter une fois le compte confirmé."
        );
        resetRegisterForm();
        resetRecaptcha();
      } else {
        setSuccess("Inscription réussie. Vérifiez votre email pour activer votre compte, puis connectez-vous.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription. Veuillez réessayer.");
      resetRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  const resetRegisterForm = useCallback(() => {
    setRegisterForm({
      name: "",
      email: "",
      password: "",
      role: "child",
      parentEmail: "",
    });
  }, []);

  const handleGoogleLogin = useCallback(() => {
    window.location.href = `${API_BASE}/api/auth/google`;
  }, [API_BASE]);

  const handleFacebookLogin = useCallback(() => {
    window.location.href = `${API_BASE}/api/auth/facebook`;
  }, [API_BASE]);

  const toggleMode = useCallback(() => {
    setIsRegisterMode((prev) => !prev);
    clearMessages();
    resetRecaptcha();
  }, [clearMessages, resetRecaptcha]);

  const formsLeft = isRegisterMode ? '0%' : '40%';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4 overflow-hidden">
      {/* Particules décoratives */}
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
        className="relative w-full max-w-6xl h-[700px]"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden relative h-full">
          
            {/* Panel coloré animé - Desktop */}
            <motion.div
              animate={{
                left: isRegisterMode ? "60%" : "0%",
              }}
              transition={{ 
                type: "spring",
                stiffness: 90,
                damping: 18,
              }}
              className="hidden md:block absolute top-0 w-2/5 h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 z-10 shadow-2xl"
            >
              <div className="h-full p-8 flex flex-col justify-center items-center text-white text-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isRegisterMode ? "register" : "login"}
                    initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Logo */}
                    <motion.div className="mb-8">
                      <motion.div 
                        className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
                        whileHover={{ scale: 1.05, rotate: 3 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Rocket className="w-10 h-10 text-white" />
                      </motion.div>
                      <h1 className="text-3xl font-bold">Future Markers</h1>
                      <p className="text-indigo-100 mt-2 text-sm">Apprendre en s'amusant</p>
                    </motion.div>

                    {/* Message */}
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      {isRegisterMode ? "Déjà membre ?" : "Nouveau ici ?"}
                    </h2>
                    <p className="text-base md:text-lg mb-8 text-indigo-100 leading-relaxed px-4">
                      {isRegisterMode
                        ? "Reconnectez-vous et continuez votre aventure d'apprentissage"
                        : "Rejoignez notre communauté et découvrez un monde d'opportunités"}
                    </p>
                    
                    {/* Icônes */}
                    <div className="flex justify-center gap-6 mb-8">
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <Star className="w-6 h-6 text-yellow-300" />
                      </motion.div>
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }} 
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Heart className="w-6 h-6 text-pink-300" />
                      </motion.div>
                      <motion.div 
                        animate={{ y: [-5, 5, -5] }} 
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Users className="w-6 h-6 text-blue-300" />
                      </motion.div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleMode}
                      className="px-8 py-3 border-2 border-white rounded-full font-semibold hover:bg-white hover:text-indigo-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                    >
                      {isRegisterMode ? "Se connecter" : "Créer un compte"}
                    </motion.button>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Formulaires */}
            <div 
              style={{ left: formsLeft }}
              className="relative w-full p-6 md:p-12 flex flex-col justify-center overflow-y-auto md:absolute md:top-0 md:h-full md:w-3/5 z-20"
            >
              <AnimatePresence mode="wait">
                {!isRegisterMode ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">Bienvenue !</h2>
                      <p className="text-gray-600">Connectez-vous pour accéder à votre compte</p>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div className="space-y-3">
                        <OAuthButton label="Continuer avec Google" color="white" icon="google" onClick={handleGoogleLogin} disabled={loading} />
                        <OAuthButton label="Continuer avec Facebook" color="#1877F2" icon="facebook" onClick={handleFacebookLogin} disabled={loading} />
                      </div>

                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white text-gray-500">Ou avec email</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" aria-hidden="true" />
                          <input
                            id="login-email"
                            required
                            type="email"
                            placeholder="Adresse email"
                            value={loginForm.email}
                            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:bg-gray-50"
                            disabled={loading}
                            aria-label="Adresse email"
                          />
                        </div>

                        <PasswordInput
                          id="login-password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          placeholder="Mot de passe"
                          disabled={loading}
                        />

                        <div className="flex justify-center py-2">
                          <ReCAPTCHA 
                            ref={recaptchaRef} 
                            sitekey={RECAPTCHA_SITE_KEY} 
                            onChange={handleRecaptchaChange} 
                          />
                        </div>

                        <motion.button
                          whileHover={{ scale: loading ? 1 : 1.01 }}
                          whileTap={{ scale: loading ? 1 : 0.99 }}
                          type="submit"
                          disabled={loading}
                          className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {loading ? "Connexion en cours..." : "Se connecter"}
                        </motion.button>

                        <AnimatePresence mode="wait">
                          {error && <Alert message={error} color="red" />}
                        </AnimatePresence>

                        <div className="text-center space-y-3 pt-2">
                          <p className="text-sm text-gray-600 md:hidden">
                            Pas encore de compte ?{" "}
                            <button type="button" onClick={toggleMode} className="text-indigo-600 hover:underline font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded">
                              S'inscrire
                            </button>
                          </p>
                          <p className="text-sm text-gray-600">
                            <a href="/forgot-password" className="text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded">
                              Mot de passe oublié ?
                            </a>
                          </p>
                        </div>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">Créer un compte</h2>
                      <p className="text-gray-600">Rejoignez-nous et commencez votre aventure</p>
                    </div>

                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <div className="space-y-3">
                        <OAuthButton label="S'inscrire avec Google" color="white" icon="google" onClick={handleGoogleLogin} disabled={loading} />
                        <OAuthButton label="S'inscrire avec Facebook" color="#1877F2" icon="facebook" onClick={handleFacebookLogin} disabled={loading} />
                      </div>

                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white text-gray-500">Ou avec email</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" aria-hidden="true" />
                          <input
                            id="register-name"
                            required
                            type="text"
                            placeholder="Nom complet"
                            value={registerForm.name}
                            onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:bg-gray-50"
                            disabled={loading}
                            aria-label="Nom complet"
                          />
                        </div>

                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" aria-hidden="true" />
                          <input
                            id="register-email"
                            required
                            type="email"
                            placeholder="Adresse email"
                            value={registerForm.email}
                            onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:bg-gray-50"
                            disabled={loading}
                            aria-label="Adresse email"
                          />
                        </div>

                        <PasswordInput
                          id="register-password"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          placeholder="Mot de passe (min. 8 caractères)"
                          disabled={loading}
                        />

                        <div className="relative">
                          <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" aria-hidden="true" />
                          <select
                            id="register-role"
                            value={registerForm.role}
                            onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all appearance-none bg-white disabled:bg-gray-50"
                            disabled={loading}
                            aria-label="Type de compte"
                          >
                            <option value="child">Enfant</option>
                            <option value="woman">Femme</option>
                            <option value="mentor">Mentor</option>
                            <option value="investor">Investisseur</option>
                            <option value="admin">Administrateur</option>
                          </select>
                        </div>

                        <AnimatePresence>
                          {registerForm.role === "child" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" aria-hidden="true" />
                                <input
                                  id="parent-email"
                                  required
                                  type="email"
                                  placeholder="Email du parent"
                                  value={registerForm.parentEmail}
                                  onChange={(e) => setRegisterForm({ ...registerForm, parentEmail: e.target.value })}
                                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:bg-gray-50"
                                  disabled={loading}
                                  aria-label="Email du parent"
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="flex justify-center py-2">
                          <ReCAPTCHA 
                            ref={recaptchaRef} 
                            sitekey={RECAPTCHA_SITE_KEY} 
                            onChange={handleRecaptchaChange} 
                          />
                        </div>

                        <motion.button
                          whileHover={{ scale: loading ? 1 : 1.01 }}
                          whileTap={{ scale: loading ? 1 : 0.99 }}
                          type="submit"
                          disabled={loading}
                          className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {loading ? "Création du compte..." : "S'inscrire"}
                        </motion.button>

                        <AnimatePresence mode="wait">
                          {error && <Alert message={error} color="red" />}
                          {success && <Alert message={success} color="green" />}
                        </AnimatePresence>

                        <div className="text-center md:hidden pt-2">
                          <p className="text-sm text-gray-600">
                            Déjà un compte ?{" "}
                            <button type="button" onClick={toggleMode} className="text-indigo-600 hover:underline font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded">
                              Se connecter
                            </button>
                          </p>
                        </div>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

        </div>
      </motion.div>
    </div>
  );
}