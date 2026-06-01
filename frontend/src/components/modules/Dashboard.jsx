import { useApp } from "../../context/AppContext";
import { Card, T, Chip, Avatar, Spinner } from "../common/UI";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const PIE_COLORS = [T.teal, "#3b82f6", "#94a3b8"];
const MONTHLY = [
  { month:"Jan", revenue:125000 }, { month:"Feb", revenue:142000 },
  { month:"Mar", revenue:98000  }, { month:"Apr", revenue:167000 },
];

export default function Dashboard() {
  const { patients, doctors, appointments, bills, loading } = useApp();
  if (loading) return <Spinner />;

  const paidTotal    = bills.filter(b=>b.status==="Paid").reduce((s,b)=>s+b.items.reduce((a,i)=>a+i.amt,0),0);
  const pendingTotal = bills.filter(b=>b.status==="Pending").reduce((s,b)=>s+b.items.reduce((a,i)=>a+i.amt,0),0);

  const kpis = [
    { label:"Total Patients",    value:patients.length,                                      icon:"👥", color:"#0d9488", sub:"+2 this week" },
    { label:"Active Doctors",    value:doctors.filter(d=>d.status==="Active").length,         icon:"👨‍⚕️", color:"#3b82f6", sub:"1 on leave"  },
    { label:"Scheduled Appts",   value:appointments.filter(a=>a.status==="Scheduled").length, icon:"📅", color:"#8b5cf6", sub:"Today"        },
    { label:"Revenue Collected", value:`₹${(paidTotal/1000).toFixed(0)}K`,                   icon:"💰", color:"#f59e0b", sub:`₹${(pendingTotal/1000).toFixed(0)}K pending` },
  ];

  const patientStatus = [
    { name:"Admitted",   value:patients.filter(p=>p.status==="Admitted").length   },
    { name:"Outpatient", value:patients.filter(p=>p.status==="Outpatient").length },
    { name:"Discharged", value:patients.filter(p=>p.status==="Discharged").length },
  ];

  const apptTypes = ["Consultation","Follow-up","Emergency"].map(t=>({
    name:t, count:appointments.filter(a=>a.type===t).length,
  }));

  const upcoming   = appointments.filter(a=>a.status==="Scheduled").slice(0,5);
  const pendingBills = bills.filter(b=>b.status==="Pending").slice(0,4);

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:T.text }}>Dashboard</h1>
        <p style={{ margin:"4px 0 0", color:T.muted, fontSize:14 }}>
          Real-time overview of CityCare Hospital operations
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {kpis.map(k => (
          <Card key={k.label} style={{ position:"relative", overflow:"hidden" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <span style={{ fontSize:28 }}>{k.icon}</span>
              <span style={{ fontSize:24, fontWeight:800, color:k.color }}>{k.value}</span>
            </div>
            <p style={{ margin:0, fontWeight:600, fontSize:14, color:T.text }}>{k.label}</p>
            <p style={{ margin:"3px 0 0", fontSize:12, color:T.muted }}>{k.sub}</p>
            <div style={{ position:"absolute", bottom:0, left:0, right:0,
              height:3, background:k.color, opacity:0.3 }} />
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:24 }}>
        <Card>
          <h3 style={{ margin:"0 0 18px", fontSize:14, fontWeight:700, color:T.text }}>
            Monthly Revenue (₹)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize:12, fill:T.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:T.muted }} tickFormatter={v=>`${v/1000}K`} axisLine={false} tickLine={false} />
              <Tooltip formatter={v=>[`₹${Number(v).toLocaleString()}`,"Revenue"]}
                contentStyle={{ borderRadius:8, border:`1px solid ${T.border}`, fontSize:13 }} />
              <Bar dataKey="revenue" fill={T.teal} radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 style={{ margin:"0 0 8px", fontSize:14, fontWeight:700, color:T.text }}>Patient Status</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={patientStatus} dataKey="value" cx="50%" cy="50%"
                outerRadius={60} paddingAngle={3}
                label={({name,value})=>`${name} ${value}`} labelLine={false} fontSize={10}>
                {patientStatus.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius:8, border:`1px solid ${T.border}`, fontSize:13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexDirection:"column", gap:5, marginTop:8 }}>
            {patientStatus.map((s,i)=>(
              <div key={s.name} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12 }}>
                <span style={{ width:10, height:10, borderRadius:2, background:PIE_COLORS[i], flexShrink:0 }} />
                <span style={{ color:T.muted }}>{s.name}</span>
                <span style={{ marginLeft:"auto", fontWeight:700, color:T.text }}>{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card>
          <h3 style={{ margin:"0 0 16px", fontSize:14, fontWeight:700, color:T.text }}>
            Upcoming Appointments
          </h3>
          {upcoming.length===0 && <p style={{ color:T.muted, fontSize:13 }}>No scheduled appointments.</p>}
          {upcoming.map(a => {
            const pName = a.patientId?.name || "—";
            const dName = a.doctorId?.name  || "—";
            const dt    = a.date ? new Date(a.date).toLocaleDateString("en-IN") : "—";
            return (
              <div key={a._id} style={{ display:"flex", alignItems:"center",
                padding:"10px 0", borderBottom:`1px solid ${T.border}`, gap:10 }}>
                <Avatar name={pName} size={36} radius={9} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontWeight:600, fontSize:13, color:T.text,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{pName}</p>
                  <p style={{ margin:0, fontSize:11, color:T.muted }}>
                    {dName} · {dt} {a.time}
                  </p>
                </div>
                <Chip label={a.type} />
              </div>
            );
          })}
        </Card>

        <Card>
          <h3 style={{ margin:"0 0 16px", fontSize:14, fontWeight:700, color:T.text }}>
            Appointment Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={apptTypes} layout="vertical" barSize={16}>
              <XAxis type="number" tick={{ fontSize:11, fill:T.muted }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={90}
                tick={{ fontSize:12, fill:T.muted }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius:8, border:`1px solid ${T.border}`, fontSize:13 }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>

          <h3 style={{ margin:"20px 0 12px", fontSize:14, fontWeight:700, color:T.text }}>Pending Bills</h3>
          {pendingBills.length===0 && <p style={{ color:T.muted, fontSize:13 }}>All bills cleared.</p>}
          {pendingBills.map(b=>{
            const pName = b.patientId?.name || "—";
            const total = b.items?.reduce((s,i)=>s+i.amt,0)||0;
            return (
              <div key={b._id} style={{ display:"flex", justifyContent:"space-between",
                padding:"8px 0", borderBottom:`1px solid ${T.border}`, fontSize:13 }}>
                <span style={{ color:T.text, fontWeight:500 }}>{pName}</span>
                <span style={{ color:"#f59e0b", fontWeight:700 }}>₹{total.toLocaleString()}</span>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
