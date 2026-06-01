import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Card, Btn, Field, Input, Select, Modal, Chip, PageHeader, SearchBar, Empty, Spinner, Avatar, T } from "../common/UI";

const SPECIALTIES = ["Cardiology","Neurology","Pediatrics","Orthopedics","Dermatology",
                     "Oncology","General Surgery","ENT","Ophthalmology","Psychiatry"];
const AVATAR_COLORS = [
  {bg:"#ede9fe",fg:"#6d28d9"},{bg:"#dbeafe",fg:"#1d4ed8"},{bg:"#dcfce7",fg:"#15803d"},
  {bg:"#fef9c3",fg:"#a16207"},{bg:"#fee2e2",fg:"#b91c1c"},
];

export default function Doctors() {
  const { auth, doctors, addDoctor, updateDoctor, deleteDoctor, loading } = useApp();
  const [search, setSearch] = useState("");
  const [modal,  setModal]  = useState(null);
  const [sel,    setSel]    = useState(null);
  const [form,   setForm]   = useState({});
  const [saving, setSaving] = useState(false);
  const F = (k,v) => setForm(f=>({...f,[k]:v}));

  const filtered = doctors.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty?.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setForm({ name:"", specialty:"Cardiology", phone:"", email:"", exp:"", status:"Active", schedule:"Mon–Fri" });
    setModal("add");
  }

  async function handleSave() {
    if (!form.name?.trim() || !form.specialty) return;
    setSaving(true);
    try {
      const payload = { ...form, exp: Number(form.exp)||0 };
      if (modal==="add") await addDoctor(payload);
      else               await updateDoctor(sel._id, payload);
      setModal(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this doctor record?")) return;
    await deleteDoctor(id);
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Doctors"
        subtitle={`${doctors.filter(d=>d.status==="Active").length} active · ${doctors.length} total`}
        action={auth?.role === "Admin" && <Btn onClick={openAdd}>+ Add Doctor</Btn>}
      />

      <SearchBar value={search} onChange={setSearch} placeholder="🔍  Search by name or specialty…" />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(268px,1fr))", gap:16 }}>
        {filtered.map((d,i)=>{
          const {bg,fg} = AVATAR_COLORS[i % AVATAR_COLORS.length];
          return (
            <Card key={d._id}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <Avatar name={d.name} bg={bg} fg={fg} size={48} radius={14} />
                  <div>
                    <p style={{ margin:0, fontWeight:700, fontSize:15, color:T.text }}>{d.name}</p>
                    <p style={{ margin:"2px 0 0", fontSize:12, color:T.muted }}>{d.specialty}</p>
                  </div>
                </div>
                <Chip label={d.status} />
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                {[["Experience",`${d.exp||0} yrs`],["Patients",d.patients||0],["Schedule",d.schedule||"—"]].map(([k,v])=>(
                  <div key={k} style={{ background:"#f8fafc", borderRadius:8, padding:"8px 10px" }}>
                    <p style={{ margin:0, fontSize:10, color:T.muted, fontWeight:600,
                      textTransform:"uppercase", letterSpacing:"0.04em" }}>{k}</p>
                    <p style={{ margin:"2px 0 0", fontSize:14, fontWeight:700, color:T.text }}>{v}</p>
                  </div>
                ))}
              </div>

              <div style={{ fontSize:12, color:T.muted, marginBottom:14, lineHeight:1.8 }}>
                📧 {d.email}<br/>📞 {d.phone}
              </div>

              {auth?.role === "Admin" && (
                <div style={{ display:"flex", gap:8 }}>
                  <Btn small variant="ghost" style={{ flex:1 }}
                    onClick={()=>{ setSel(d); setForm({
                      name:d.name, specialty:d.specialty, phone:d.phone, email:d.email,
                      exp:d.exp||"", status:d.status, schedule:d.schedule||"Mon–Fri",
                    }); setModal("edit"); }}>
                    Edit
                  </Btn>
                  <Btn small variant="danger" onClick={()=>handleDelete(d._id)}>Delete</Btn>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {filtered.length===0 && <Card><Empty message="No doctors match your search." /></Card>}

      {(modal==="add"||modal==="edit") && (
        <Modal title={modal==="add"?"Add New Doctor":"Edit Doctor"} onClose={()=>setModal(null)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
            <Field label="Full Name *"><Input value={form.name||""} onChange={v=>F("name",v)} placeholder="Dr. First Last" /></Field>
            <Field label="Specialty *"><Select value={form.specialty||""} onChange={v=>F("specialty",v)} options={SPECIALTIES} /></Field>
            <Field label="Phone"><Input value={form.phone||""} onChange={v=>F("phone",v)} placeholder="+91-XXXXX-XXXXX" /></Field>
            <Field label="Email"><Input value={form.email||""} onChange={v=>F("email",v)} placeholder="doctor@hospital.com" /></Field>
            <Field label="Experience (yrs)"><Input type="number" value={form.exp||""} onChange={v=>F("exp",v)} placeholder="Years" /></Field>
            <Field label="Schedule"><Input value={form.schedule||""} onChange={v=>F("schedule",v)} placeholder="e.g. Mon–Fri" /></Field>
            <Field label="Status">
              <Select value={form.status||"Active"} onChange={v=>F("status",v)} options={["Active","On Leave","Inactive"]} />
            </Field>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
            <Btn variant="secondary" onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : modal==="add" ? "Add Doctor" : "Save Changes"}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
