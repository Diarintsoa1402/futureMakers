import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import API from "../services/api";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, setUserFromOAuth } = useAuth();

  // 🔹 Étape 1 : lecture des paramètres de callback
  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");
    const error = searchParams.get("error");

    if (error) {
      navigate("/login?error=" + error);
      return;
    }

    // Si pas de token → retour login
    if (!token) {
      navigate("/login");
      return;
    }

    // Stocke le token pour les requêtes API
    localStorage.setItem("fm_token", token);

    // 🔹 Si on a un user directement dans l'URL
    if (userStr) {
      try {
        const decodedUser = JSON.parse(decodeURIComponent(userStr));
        setUserFromOAuth(decodedUser, token);
      } catch (err) {
        console.error("Erreur de parsing user OAuth :", err);
        navigate("/login?error=invalid_user_data");
      }
    } else {
      // 🔹 Sinon, on récupère le profil depuis le backend
      API.get("/auth/me")
        .then(({ data }) => {
          if (data.user) {
            setUserFromOAuth(data.user, token);
          } else {
            navigate("/login?error=no_user");
          }
        })
        .catch((err) => {
          console.error("Erreur /auth/me :", err);
          navigate("/login?error=invalid_token");
        });
    }
  }, [searchParams, navigate, setUserFromOAuth]);

  // 🔹 Étape 2 : redirection automatique quand user est prêt
  useEffect(() => {
    if (!user) return;

    switch (user.role) {
      case "child":
        navigate("/child/courses", { replace: true });
        break;
      case "woman":
        navigate("/woman", { replace: true });
        break;
      case "mentor":
        navigate("/mentor", { replace: true });
        break;
      case "investor":
        navigate("/investor", { replace: true });
        break;
      case "admin":
        navigate("/admin", { replace: true });
        break;
      default:
        navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // 🔹 Affichage de chargement
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Connexion en cours...</p>
      </div>
    </div>
  );
}
