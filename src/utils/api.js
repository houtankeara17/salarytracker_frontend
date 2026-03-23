// src/utils/api.js
import axios from "axios";

/*
  API Base URL
  Local: http://localhost:5001/api
  Production: https://salarytracker-backend.onrender.com/api
*/

const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    // "https://salarytracker-backend.onrender.com/api",
    "http://localhost:5001/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===============================
// Request Interceptor (Attach JWT)
// ===============================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("mt_token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ===============================
// Response Interceptor
// ===============================
// ===============================
// Response Interceptor
// ===============================
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const lang = localStorage.getItem("mt_language") || "en";
    const kh = lang === "kh";

    const isAuthRoute =
      window.location.pathname === "/login" ||
      window.location.pathname === "/register";

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem("mt_token");
      sessionStorage.removeItem("mt_token");
      delete api.defaults.headers.common["Authorization"];
      window.location.href = "/login";
    }

    // ── Timeout / Network errors ──
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return Promise.reject(
        new Error(
          kh
            ? "ការតភ្ជាប់យឺតពេក។ សូមព្យាយាមម្តងទៀត"
            : "Connection timed out. Please try again.",
        ),
      );
    }

    if (!error.response) {
      return Promise.reject(
        new Error(
          kh
            ? "គ្មានការតភ្ជាប់អ៊ីនធឺណិត។ សូមពិនិត្យការតភ្ជាប់របស់អ្នក"
            : "No internet connection. Please check your network.",
        ),
      );
    }

    // ── HTTP status errors ──
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    const statusMessages = {
      400: kh ? "សំណើមិនត្រឹមត្រូវ" : "Bad request.",
      403: kh ? "អ្នកគ្មានសិទ្ធិចូលប្រើ" : "Access denied.",
      404: kh ? "រកមិនឃើញទិន្នន័យ" : "Resource not found.",
      500: kh ? "មានបញ្ហាក្នុងម៉ាស៊ីនមេ" : "Server error. Please try again.",
    };

    const message =
      serverMessage ||
      statusMessages[status] ||
      (kh ? "មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត" : "Something went wrong.");

    return Promise.reject(new Error(message));
  },
);

// ===============================
// Salary API
// ===============================
export const salaryAPI = {
  getAll: (params) => api.get("/salaries", { params }),
  getOne: (id) => api.get(`/salaries/${id}`),
  create: (data) => api.post("/salaries", data),
  update: (id, data) => api.put(`/salaries/${id}`, data),
  delete: (id) => api.delete(`/salaries/${id}`),
};

// ===============================
// Bonus API
// ===============================
export const bonusAPI = {
  getAll: (params) => api.get("/bonuses", { params }),
  getOne: (id) => api.get(`/bonuses/${id}`),
  create: (data) => api.post("/bonuses", data),
  update: (id, data) => api.put(`/bonuses/${id}`, data),
  delete: (id) => api.delete(`/bonuses/${id}`),
};

// ===============================
// Savings API
// ===============================
export const savingAPI = {
  getAll: (params) => api.get("/savings", { params }),
  getOne: (id) => api.get(`/savings/${id}`),
  create: (data) => api.post("/savings", data),
  update: (id, data) => api.put(`/savings/${id}`, data),
  delete: (id) => api.delete(`/savings/${id}`),
};

// ===============================
// Expense API
// ===============================
export const expenseAPI = {
  getAll: (params) => api.get("/expenses", { params }),
  getOne: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post("/expenses", data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getStats: () => api.get("/expenses/stats"),
};

// ===============================
// Trip API
// ===============================
export const tripAPI = {
  getAll: (params) => api.get("/trips", { params }),
  getOne: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post("/trips", data),
  update: (id, data) => api.put(`/trips/${id}`, data),
  delete: (id) => api.delete(`/trips/${id}`),
};

// ===============================
// Goal API
// ===============================
export const goalAPI = {
  getAll: (params) => api.get("/goals", { params }),
  getOne: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post("/goals", data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
};

// ===============================
// Giving API
// ===============================
export const givingAPI = {
  getAll: (params) => api.get("/givings", { params }),
  getOne: (id) => api.get(`/givings/${id}`),
  create: (data) => api.post("/givings", data),
  update: (id, data) => api.put(`/givings/${id}`, data),
  delete: (id) => api.delete(`/givings/${id}`),
};

// ===============================
// Other API
// ===============================
export const otherAPI = {
  getAll: (params) => api.get("/others", { params }),
  getOne: (id) => api.get(`/others/${id}`),
  create: (data) => api.post("/others", data),
  update: (id, data) => api.put(`/others/${id}`, data),
  delete: (id) => api.delete(`/others/${id}`),
};

// ===============================
// Notes API  ← add this to api.js
// ===============================
export const noteAPI = {
  getAll: () => api.get("/notes"),
  create: (data) => api.post("/notes", data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
  togglePin: (id) => api.patch(`/notes/${id}/pin`),
};

// ===============================
// Dashboard API
// ===============================
export const dashboardAPI = {
  // NEW - passes month/year as query params
  getSummary: (params) => api.get("/dashboard/summary", { params }),
};

export default api;
