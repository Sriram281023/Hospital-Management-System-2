import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI, patientsAPI, doctorsAPI, appointmentsAPI, billsAPI } from "../api";

const AppContext = createContext();

export function AppProvider({ children }) {
  // ── Auth ────────────────────────────────────────────────────────────
  const [auth,    setAuth]    = useState(null);
  const [authChecked, setAuthChecked] = useState(false); // indicates we've validated stored token

  // ── Data ───────────────────────────────────────────────────────────
  const [patients,     setPatients]     = useState([]);
  const [doctors,      setDoctors]      = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills,        setBills]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [toast,        setToast]        = useState(null);

  // ── Toast helper ───────────────────────────────────────────────────
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Validate stored token on app start
  const verifyAuth = useCallback(async () => {
    const token = localStorage.getItem("hms_token");
    const userStr = localStorage.getItem("hms_user");
    if (!token || !userStr) {
      setAuth(null);
      setAuthChecked(true);
      return;
    }

    try {
      // authAPI.getMe will use the token from localStorage via axios interceptor
      const { data } = await authAPI.getMe();
      setAuth(data.user);
    } catch (err) {
      // token invalid/expired — clear stored creds
      localStorage.removeItem("hms_token");
      localStorage.removeItem("hms_user");
      setAuth(null);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => { verifyAuth(); }, [verifyAuth]);

  // ── Auth actions ───────────────────────────────────────────────────
  const login = async (username, password) => {
    const { data } = await authAPI.login({ username, password });
    localStorage.setItem("hms_token", data.token);
    localStorage.setItem("hms_user",  JSON.stringify(data.user));
    setAuth(data.user);
    return data;
  };

  const register = async (name, username, password, role) => {
    const { data } = await authAPI.register({ name, username, password, role });
    localStorage.setItem("hms_token", data.token);
    localStorage.setItem("hms_user",  JSON.stringify(data.user));
    setAuth(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("hms_token");
    localStorage.removeItem("hms_user");
    setAuth(null);
  };

  // ── Fetch helpers ───────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!auth) return;
    setLoading(true);
    try {
      const [p, d, a, b] = await Promise.all([
        patientsAPI.getAll(),
        doctorsAPI.getAll(),
        appointmentsAPI.getAll(),
        billsAPI.getAll(),
      ]);
      setPatients(p.data.data);
      setDoctors(d.data.data);
      setAppointments(a.data.data);
      setBills(b.data.data);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, [auth, showToast]);

  // Only fetch when auth is available (and after verification)
  useEffect(() => {
    if (auth) fetchAll();
  }, [auth, fetchAll]);

  // ── Patient CRUD ───────────────────────────────────────────────────
  const addPatient = async (data) => {
    const res = await patientsAPI.create(data);
    setPatients(prev => [res.data.data, ...prev]);
    showToast("Patient added successfully!");
    return res.data.data;
  };
  const updatePatient = async (id, data) => {
    const res = await patientsAPI.update(id, data);
    setPatients(prev => prev.map(p => p._id === id ? res.data.data : p));
    showToast("Patient updated!");
    return res.data.data;
  };
  const deletePatient = async (id) => {
    await patientsAPI.remove(id);
    setPatients(prev => prev.filter(p => p._id !== id));
    showToast("Patient removed.");
  };

  // ── Doctor CRUD ───────────────────────────────────────────────────
  const addDoctor = async (data) => {
    const res = await doctorsAPI.create(data);
    setDoctors(prev => [res.data.data, ...prev]);
    showToast("Doctor added!");
    return res.data.data;
  };
  const updateDoctor = async (id, data) => {
    const res = await doctorsAPI.update(id, data);
    setDoctors(prev => prev.map(d => d._id === id ? res.data.data : d));
    showToast("Doctor updated!");
    return res.data.data;
  };
  const deleteDoctor = async (id) => {
    await doctorsAPI.remove(id);
    setDoctors(prev => prev.filter(d => d._id !== id));
    showToast("Doctor removed.");
  };

  // ── Appointment CRUD ───────────────────────────────────────────────
  const addAppointment = async (data) => {
    const res = await appointmentsAPI.create(data);
    setAppointments(prev => [...prev, res.data.data]);
    showToast("Appointment scheduled!");
    return res.data.data;
  };
  const updateAppointment = async (id, data) => {
    const res = await appointmentsAPI.update(id, data);
    setAppointments(prev => prev.map(a => a._id === id ? res.data.data : a));
    showToast(`Appointment updated!`);
    return res.data.data;
  };
  const deleteAppointment = async (id) => {
    await appointmentsAPI.remove(id);
    setAppointments(prev => prev.filter(a => a._id !== id));
    showToast("Appointment removed.");
  };

  // ── Bill CRUD ─────────────────────────────────────────────────────
  const addBill = async (data) => {
    const res = await billsAPI.create(data);
    setBills(prev => [res.data.data, ...prev]);
    showToast("Bill created!");
    return res.data.data;
  };
  const updateBill = async (id, data) => {
    const res = await billsAPI.update(id, data);
    setBills(prev => prev.map(b => b._id === id ? res.data.data : b));
    showToast("Bill updated!");
    return res.data.data;
  };
  const deleteBill = async (id) => {
    await billsAPI.remove(id);
    setBills(prev => prev.filter(b => b._id !== id));
    showToast("Bill deleted.");
  };

  return (
    <AppContext.Provider value={{
      auth, authChecked, login, logout, register,
      patients, addPatient, updatePatient, deletePatient,
      doctors,  addDoctor,  updateDoctor,  deleteDoctor,
      appointments, addAppointment, updateAppointment, deleteAppointment,
      bills, addBill, updateBill, deleteBill,
      loading, showToast, toast, fetchAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
