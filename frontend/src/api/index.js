import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hms_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — token expired
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("hms_token");
      localStorage.removeItem("hms_user");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => api.post("/auth/login",    data),
  register: (data) => api.post("/auth/register", data),
  getMe:    ()     => api.get("/auth/me"),
};

// ─── Patients ─────────────────────────────────────────────────────────────────
export const patientsAPI = {
  getAll:  (params) => api.get("/patients",       { params }),
  getOne:  (id)     => api.get(`/patients/${id}`),
  create:  (data)   => api.post("/patients",      data),
  update:  (id, data) => api.put(`/patients/${id}`, data),
  remove:  (id)     => api.delete(`/patients/${id}`),
  stats:   ()       => api.get("/patients/stats"),
};

// ─── Doctors ──────────────────────────────────────────────────────────────────
export const doctorsAPI = {
  getAll:  (params)   => api.get("/doctors",       { params }),
  getOne:  (id)       => api.get(`/doctors/${id}`),
  create:  (data)     => api.post("/doctors",      data),
  update:  (id, data) => api.put(`/doctors/${id}`, data),
  remove:  (id)       => api.delete(`/doctors/${id}`),
};

// ─── Appointments ─────────────────────────────────────────────────────────────
export const appointmentsAPI = {
  getAll:  (params)   => api.get("/appointments",       { params }),
  getOne:  (id)       => api.get(`/appointments/${id}`),
  create:  (data)     => api.post("/appointments",      data),
  update:  (id, data) => api.put(`/appointments/${id}`, data),
  remove:  (id)       => api.delete(`/appointments/${id}`),
  stats:   ()         => api.get("/appointments/stats"),
};

// ─── Bills ────────────────────────────────────────────────────────────────────
export const billsAPI = {
  getAll:   (params)   => api.get("/bills",          { params }),
  getOne:   (id)       => api.get(`/bills/${id}`),
  create:   (data)     => api.post("/bills",         data),
  update:   (id, data) => api.put(`/bills/${id}`,    data),
  remove:   (id)       => api.delete(`/bills/${id}`),
  summary:  ()         => api.get("/bills/summary"),
};

export default api;
