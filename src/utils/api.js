// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Auto-attach token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("mt_token");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err),
);

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("mt_token");
      delete api.defaults.headers.common["Authorization"];
      // Let AuthContext handle redirect
    }
    const msg = err.response?.data?.message || err.message || "Network Error";
    return Promise.reject(new Error(msg));
  },
);

export const salaryAPI = {
  getAll: (params) => api.get("/salaries", { params }),
  getOne: (id) => api.get(`/salaries/${id}`),
  create: (data) => api.post("/salaries", data),
  update: (id, data) => api.put(`/salaries/${id}`, data),
  delete: (id) => api.delete(`/salaries/${id}`),
};
export const savingAPI = {
  getAll: (params) => api.get("/savings", { params }),
  getOne: (id) => api.get(`/savings/${id}`),
  create: (data) => api.post("/savings", data),
  update: (id, data) => api.put(`/savings/${id}`, data),
  delete: (id) => api.delete(`/savings/${id}`),
};
export const expenseAPI = {
  getAll: (params) => api.get("/expenses", { params }),
  getOne: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post("/expenses", data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getStats: () => api.get("/expenses/stats"),
};
export const tripAPI = {
  getAll: (params) => api.get("/trips", { params }),
  getOne: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post("/trips", data),
  update: (id, data) => api.put(`/trips/${id}`, data),
  delete: (id) => api.delete(`/trips/${id}`),
};
export const goalAPI = {
  getAll: (params) => api.get("/goals", { params }),
  getOne: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post("/goals", data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
};
export const givingAPI = {
  getAll: (params) => api.get("/givings", { params }),
  getOne: (id) => api.get(`/givings/${id}`),
  create: (data) => api.post("/givings", data),
  update: (id, data) => api.put(`/givings/${id}`, data),
  delete: (id) => api.delete(`/givings/${id}`),
};
export const otherAPI = {
  getAll: (params) => api.get("/others", { params }),
  getOne: (id) => api.get(`/others/${id}`),
  create: (data) => api.post("/others", data),
  update: (id, data) => api.put(`/others/${id}`, data),
  delete: (id) => api.delete(`/others/${id}`),
};
export const dashboardAPI = {
  getSummary: () => api.get("/dashboard/summary"),
};
export default api;
