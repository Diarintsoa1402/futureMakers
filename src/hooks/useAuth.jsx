import { useState, useEffect, createContext, useContext } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("fm_user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("fm_user", JSON.stringify(user));
    else localStorage.removeItem("fm_user");
  }, [user]);

  const login = async (email, password, recaptchaToken) => {
    const { data } = await API.post("/auth/login", {
      email,
      password,
      recaptchaToken,
    });

    localStorage.setItem("fm_token", data.token);
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const { data } = await API.post("/auth/register", payload);
    // Ne pas connecter directement: l'utilisateur doit vérifier son email
    return data; // { message }
  };

  const setUserFromOAuth = (userData, token) => {
    localStorage.setItem("fm_token", token);
    localStorage.setItem("fm_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("fm_token");
    localStorage.removeItem("fm_user");
    setUser(null);
  };

  return (
<AuthContext.Provider value={{ user, login, register, logout, setUserFromOAuth }}>
  {children}
</AuthContext.Provider>

  );
};

export const useAuth = () => useContext(AuthContext);