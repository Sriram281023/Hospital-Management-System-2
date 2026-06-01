import { T } from "./UI";
import { useApp } from "../../context/AppContext";

const NAV = [
  { id:"dashboard",    icon:"📊", label:"Dashboard"    },
  { id:"patients",     icon:"🧑‍🤝‍🧑", label:"Patients"     },
  { id:"doctors",      icon:"👨‍⚕️", label:"Doctors"      },
  { id:"appointments", icon:"📅", label:"Appointments" },
  { id:"billing",      icon:"💳", label:"Billing"      },
];

export default function Sidebar({ page, setPage }) {
  const { auth, logout } = useApp();

  return (
    <div style={{ width:220, background:T.navy, minHeight:"100vh",
      display:"flex", flexDirection:"column", flexShrink:0,
      position:"sticky", top:0, height:"100vh" }}>

      {/* Brand */}
      <div style={{ padding:"24px 20px 14px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
          <span style={{ fontSize:22 }}>🏥</span>
          <span style={{ color:"white", fontWeight:800, fontSize:16 }}>CityCare</span>
        </div>
        <p style={{ color:"#475569", fontSize:10, margin:0, letterSpacing:"0.08em",
          textTransform:"uppercase" }}>Hospital Management</p>
      </div>

      {/* Nav Links */}
      <nav style={{ padding:"6px 12px", flex:1 }}>
        {NAV.filter(item => {
          if (auth?.role === "Patient") {
            return ["appointments", "billing"].includes(item.id);
          }
          if (auth?.role === "Doctor") {
            return ["dashboard", "patients", "doctors", "appointments"].includes(item.id);
          }
          return true; // Admin has all access
        }).map(item => {
          const active = page === item.id;
          return (
            <button key={item.id} onClick={() => setPage(item.id)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:10,
                padding:"11px 12px", borderRadius:10, border:"none", cursor:"pointer",
                marginBottom:3, background: active ? T.teal : "transparent",
                color: active ? "white" : "#94a3b8",
                fontWeight: active ? 600 : 400, fontSize:14, textAlign:"left",
                transition:"all 0.15s" }}
              onMouseOver={e => !active && (e.currentTarget.style.background = T.navyMid)}
              onMouseOut={e  => !active && (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize:15 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User section */}
      <div style={{ padding:16, borderTop:"1px solid #1e293b" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:T.teal,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontWeight:700, fontSize:14, color:"white", flexShrink:0 }}>
            {(auth?.name || "U")[0]}
          </div>
          <div style={{ minWidth:0 }}>
            <p style={{ margin:0, color:"white", fontSize:13, fontWeight:600,
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {auth?.name}
            </p>
            <p style={{ margin:0, color:"#64748b", fontSize:11 }}>{auth?.role}</p>
          </div>
        </div>
        <button onClick={logout}
          style={{ width:"100%", padding:"8px", background:T.navyMid,
            color:"#94a3b8", border:"none", borderRadius:8,
            cursor:"pointer", fontSize:13, fontWeight:500 }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
