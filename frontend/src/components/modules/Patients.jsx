import { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Card, Btn, Field, Input, Select, Modal,
  TH, TD, Chip, Avatar, PageHeader, SearchBar, Empty, Spinner, T,
} from "../common/UI";

const BLOOD = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
const STATUSES = ["Admitted","Outpatient","Discharged"];

export default function Patients() {
  const { auth, patients, doctors, addPatient, updatePatient, deletePatient, loading } = useApp();
  const [search, setSearch] = useState("");
  const [modal,  setModal]  = useState(null); // null | "add" | "edit" | "view"
  const [sel,    setSel]    = useState(null);
  const [form,   setForm]   = useState({});
  const [saving, setSaving] = useState(false);
  const F = (k,v) => setForm(f=>({...f,[k]:v}));

  const today = new Date().toISOString().split("T")[0];

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.condition?.toLowerCase().includes(search.toLowerCase()) ||
    p.status?.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setForm({ name:"", age:"", gender:"Male", phone:"", email:"",
      blood:"O+", condition:"", doctorId: doctors[0]?._id || "",
      status:"Outpatient", since: today });
    setModal("add");
  }

  function openEdit(p) {
    setForm({
      name:p.name, age:p.age, gender:p.gender, phone:p.phone, email:p.email||"",
      blood:p.blood, condition:p.condition, doctorId:p.doctorId?._id || p.doctorId || "",
      status:p.status, since: p.since ? new Date(p.since).toISOString().split("T")[0] : today,
    });
    setSel(p);
    setModal("edit");
  }

  function openView(p) { setSel(p); setModal("view"); }

  async function handleSave() {
    if (!form.name?.trim() || !form.condition?.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, age: Number(form.age) };
      if (modal === "add") await addPatient(payload);
      else                 await updatePatient(sel._id, payload);
      setModal(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this patient record?")) return;
    await deletePatient(id);
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle={`${patients.length} total · ${patients.filter(p=>p.status==="Admitted").length} admitted`}
        action={auth?.role !== "Patient" && <Btn onClick={openAdd}>+ Add Patient</Btn>}
      />

      <SearchBar value={search} onChange={setSearch}
        placeholder="🔍  Search by name, condition, or status…" />

      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>{["Patient","Age / Gender","Condition","Doctor","Status","Actions"].map(h=><TH key={h}>{h}</TH>)}</tr>
          </thead>
          <tbody>
            {filtered.map((p,i)=>{
              const docName = p.doctorId?.name || "—";
              return (
                <tr key={p._id} style={{ borderBottom:`1px solid ${T.border}`,
                  background: i%2===0?"white":"#fafbfd" }}>
                  <TD>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <Avatar name={p.name} size={36} radius={9} />
                      <div>
                        <p style={{ margin:0, fontWeight:600, color:T.text }}>{p.name}</p>
                        <p style={{ margin:0, fontSize:11, color:T.muted }}>
                          {p.blood} · since {p.since ? new Date(p.since).toLocaleDateString("en-IN") : "—"}
                        </p>
                      </div>
                    </div>
                  </TD>
                  <TD style={{ color:T.muted }}>{p.age} yrs · {p.gender}</TD>
                  <TD style={{ color:T.text }}>{p.condition}</TD>
                  <TD style={{ color:T.muted, fontSize:13 }}>{docName}</TD>
                  <TD><Chip label={p.status} /></TD>
                  <TD>
                    <div style={{ display:"flex", gap:5 }}>
                      <Btn small variant="secondary" onClick={()=>openView(p)}>View</Btn>
                      {auth?.role !== "Patient" && (
                        <Btn small variant="ghost" onClick={()=>openEdit(p)}>Edit</Btn>
                      )}
                      {auth?.role === "Admin" && (
                        <Btn small variant="danger" onClick={()=>handleDelete(p._id)}>Del</Btn>
                      )}
                    </div>
                  </TD>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length===0 && <Empty message="No patients found." />}
      </Card>

      {/* Add / Edit */}
      {(modal==="add"||modal==="edit") && (
        <Modal title={modal==="add"?"Add New Patient":"Edit Patient"} onClose={()=>setModal(null)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
            <Field label="Full Name *"><Input value={form.name||""} onChange={v=>F("name",v)} placeholder="Full name" /></Field>
            <Field label="Age *"><Input type="number" value={form.age||""} onChange={v=>F("age",v)} placeholder="Age" /></Field>
            <Field label="Gender"><Select value={form.gender||"Male"} onChange={v=>F("gender",v)} options={["Male","Female","Other"]} /></Field>
            <Field label="Blood Type"><Select value={form.blood||"O+"} onChange={v=>F("blood",v)} options={BLOOD} /></Field>
            <Field label="Phone"><Input value={form.phone||""} onChange={v=>F("phone",v)} placeholder="+91-XXXXX-XXXXX" /></Field>
            <Field label="Email"><Input value={form.email||""} onChange={v=>F("email",v)} placeholder="email@example.com" /></Field>
          </div>
          <Field label="Condition / Diagnosis *">
            <Input value={form.condition||""} onChange={v=>F("condition",v)} placeholder="Primary diagnosis" />
          </Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
            <Field label="Assigned Doctor *">
              <Select value={form.doctorId||""} onChange={v=>F("doctorId",v)}
                options={doctors.map(d=>({value:d._id,label:d.name}))} />
            </Field>
            <Field label="Status">
              <Select value={form.status||"Outpatient"} onChange={v=>F("status",v)} options={STATUSES} />
            </Field>
          </div>
          <Field label="Since">
            <Input type="date" value={form.since||today} onChange={v=>F("since",v)} />
          </Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn variant="secondary" onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : modal==="add" ? "Add Patient" : "Save Changes"}
            </Btn>
          </div>
        </Modal>
      )}

      {/* View */}
      {modal==="view" && sel && (
        <Modal title="Patient Details" onClose={()=>setModal(null)} width={460}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:22,
            padding:16, background:"#f8fafc", borderRadius:12 }}>
            <Avatar name={sel.name} size={52} radius={14} />
            <div>
              <h2 style={{ margin:0, fontSize:17, fontWeight:700 }}>{sel.name}</h2>
              <p style={{ margin:"3px 0 0", color:T.muted, fontSize:13 }}>{sel.condition}</p>
            </div>
            <div style={{ marginLeft:"auto" }}><Chip label={sel.status} /></div>
          </div>
          {[
            ["Age",    `${sel.age} years`],
            ["Gender", sel.gender],
            ["Blood",  sel.blood],
            ["Phone",  sel.phone],
            ["Email",  sel.email||"—"],
            ["Doctor", sel.doctorId?.name||"—"],
            ["Since",  sel.since?new Date(sel.since).toLocaleDateString("en-IN"):"—"],
          ].map(([k,v])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between",
              padding:"10px 0", borderBottom:`1px solid ${T.border}`, fontSize:14 }}>
              <span style={{ color:T.muted }}>{k}</span>
              <span style={{ color:T.text, fontWeight:600 }}>{v}</span>
            </div>
          ))}
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:20 }}>
            <Btn variant="secondary" onClick={()=>setModal(null)}>Close</Btn>
            {auth?.role !== "Patient" && (
              <Btn onClick={()=>{ setSel(sel); setForm({
                name:sel.name, age:sel.age, gender:sel.gender, phone:sel.phone,
                email:sel.email||"", blood:sel.blood, condition:sel.condition,
                doctorId:sel.doctorId?._id||sel.doctorId||"",
                status:sel.status, since:sel.since?new Date(sel.since).toISOString().split("T")[0]:today,
              }); setModal("edit"); }}>Edit Record</Btn>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
