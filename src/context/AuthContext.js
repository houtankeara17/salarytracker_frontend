import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

const TOKEN_KEY = "mt_token";

// Helper: reads token from either storage
const getStoredToken = () =>
  localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      api
        .get("/auth/me")
        .then((res) => setUser(res.user))
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY);
          sessionStorage.removeItem(TOKEN_KEY);
          delete api.defaults.headers.common["Authorization"];
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, rememberMe = false) => {
    const res = await api.post("/auth/login", { email, password });
    // Persist based on rememberMe: localStorage survives browser close, sessionStorage doesn't
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, res.token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, res.token);
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${res.token}`;
    setUser(res.user);
    return res.user;
  };

  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    localStorage.setItem(TOKEN_KEY, res.token); // registration always remembers
    api.defaults.headers.common["Authorization"] = `Bearer ${res.token}`;
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    toast.success("Logged out");
  };

  const updateProfile = async (data) => {
    const res = await api.put("/auth/me", data);
    setUser(res.user);
    return res.user;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await api.put("/auth/password", {
      currentPassword,
      newPassword,
    });
    // Update the stored token since a new one is issued
    const token = res.token;
    if (localStorage.getItem(TOKEN_KEY)) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(res.user);
    return res.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
