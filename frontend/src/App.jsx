import { useState, useEffect } from "react";
import { useApp } from "./context/AppContext";
import Login       from "./pages/Login";
import Sidebar     from "./components/common/Sidebar";
import Dashboard   from "./components/modules/Dashboard";
import Patients    from "./components/modules/Patients";
import Doctors     from "./components/modules/Doctors";
import Appointments from "./components/modules/Appointments";
import Billing     from "./components/modules/Billing";
import { Toast, T } from "./components/common/UI";

export default function App() {
  const { auth, authChecked, toast } = useApp();
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    if (auth) {
      setPage(auth.role === "Patient" ? "appointments" : "dashboard");
    }
  }, [auth]);

  // Wait until auth verification completes before rendering
  if (!authChecked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading…
      </div>
    );
  }

  // Not logged in → show login
  if (!auth) return <Login />;

  const PAGES = {
    dashboard:    <Dashboard />,
    patients:     <Patients />,
    doctors:      <Doctors />,
    appointments: <Appointments />,
    billing:      <Billing />,
  };

  return (
    <div style={{
      display:"flex", minHeight:"100vh",
      fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif",
      background:T.bg,
    }}>
      {/* Fixed sidebar */}
      <Sidebar page={page} setPage={setPage} />

      {/* Scrollable main area */}
      <main style={{ flex:1, padding:32, overflow:"auto", minWidth:0 }}>
        {PAGES[page] || <Dashboard />}
      </main>

      {/* Global toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
