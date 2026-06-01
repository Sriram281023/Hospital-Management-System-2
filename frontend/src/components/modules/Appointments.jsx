import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Card, Btn, Field, Input, Select, Modal, TH, TD, Chip, PageHeader, Empty, Spinner, T, INPUT_STYLE } from "../common/UI";

const APPT_TYPES = ["Consultation","Follow-up","Emergency","Lab Test","Surgery"];
const FILTER_TABS = ["All","Scheduled","Completed","Cancelled"];

export default function Appointments() {
  const { auth, appointments, patients, doctors, addAppointment, updateAppointment, deleteAppointment, loading } = useApp();
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("All");
  const [modal,  setModal]        = useState(null);
  const [form,   setForm]         = useState({});
  const [saving, setSaving]       = useState(false);
  const F = (k,v) => setForm(f=>({...f,[k]:v}));

  const today = new Date().toISOString().split("T")[0];

  const filtered = appointments.filter(a=>{
    const pName = a.patientId?.name || "";
    const dName = a.doctorId?.name  || "";
    const matchSearch = !search ||
      [pName,dName,a.type,a.notes].some(v=>v?.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter==="All" || a.status===filter;
    return matchSearch && matchFilter;
  });

  function openAdd() {
    setForm({
      patientId:patients[0]?._id||"",
      doctorId:doctors[0]?._id||"",
      date:today, time:"09:00",
      type:"Consultation", status:"Scheduled", notes:"",
    });
    setModal("add");
  }

  async function handleSave() {
    if (!form.patientId||!form.doctorId||!form.date) return;
    setSaving(true);
    try {
      await addAppointment(form);
      setModal(null);
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(id, status) {
    await updateAppointment(id, { status });
  }

  async function handleDelete(id) {
    if (!confirm("Delete this appointment?")) return;
    await deleteAppointment(id);
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle={`${appointments.filter(a=>a.status==="Scheduled").length} scheduled · ${appointments.length} total`}
        action={<Btn onClick={openAdd}>+ Schedule Appointment</Btn>}
      />

      {/* Search + Filter */}
      <Card style={{ padding:"12px 16px", marginBottom:16 }}>
        <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="🔍  Search by patient, doctor, type, or notes…"
            style={{ ...INPUT_STYLE, border:"none", outline:"none", flex:1, minWidth:200, padding:4, fontSize:14 }} />
          <div style={{ display:"flex", gap:6, flexShrink:0 }}>
            {FILTER_TABS.map(s=>(
              <button key={s} onClick={()=>setFilter(s)}
                style={{ padding:"6px 14px", borderRadius:20, cursor:"pointer", fontSize:12, fontWeight:600,
                  border:`1px solid ${filter===s?T.teal:T.border}`,
                  background:filter===s?T.teal:"white",
                  color:filter===s?"white":T.muted }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>{["Patient","Doctor","Date & Time","Type","Notes","Status","Actions"].map(h=><TH key={h}>{h}</TH>)}</tr>
          </thead>
          <tbody>
            {filtered.map((a,i)=>{
              const pName = a.patientId?.name||"—";
              const dName = a.doctorId?.name||"—";
              const dt    = a.date ? new Date(a.date).toLocaleDateString("en-IN") : "—";
              return (
                <tr key={a._id} style={{ borderBottom:`1px solid ${T.border}`, background:i%2===0?"white":"#fafbfd" }}>
                  <TD style={{ fontWeight:600, color:T.text }}>{pName}</TD>
                  <TD style={{ color:T.muted, fontSize:13 }}>{dName}</TD>
                  <TD style={{ whiteSpace:"nowrap", color:T.text }}>
                    {dt} <span style={{ color:T.muted, fontSize:12 }}>{a.time}</span>
                  </TD>
                  <TD><Chip label={a.type} /></TD>
                  <TD style={{ color:T.muted, fontSize:13, maxWidth:160,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {a.notes||"—"}
                  </TD>
                  <TD><Chip label={a.status} /></TD>
                  <TD>
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                      {a.status==="Scheduled" && (
                        <>
                          {auth?.role !== "Patient" && (
                            <Btn small variant="secondary" onClick={()=>changeStatus(a._id,"Completed")}>✓ Done</Btn>
                          )}
                          <Btn small variant="ghost" onClick={()=>changeStatus(a._id,"Cancelled")}>Cancel</Btn>
                        </>
                      )}
                      {auth?.role !== "Patient" && (
                        <Btn small variant="danger" onClick={()=>handleDelete(a._id)}>Del</Btn>
                      )}
                    </div>
                  </TD>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length===0 && <Empty message="No appointments match your search." />}
      </Card>

      {modal==="add" && (
        <Modal title="Schedule New Appointment" onClose={()=>setModal(null)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
            {auth?.role !== "Patient" ? (
              <Field label="Patient *">
                <Select value={form.patientId} onChange={v=>F("patientId",v)}
                  options={patients.map(p=>({value:p._id,label:p.name}))} />
              </Field>
            ) : (
              <Field label="Patient Name">
                <Input value={auth?.name || ""} disabled={true} />
              </Field>
            )}
            <Field label="Doctor *">
              <Select value={form.doctorId} onChange={v=>F("doctorId",v)}
                options={doctors.map(d=>({value:d._id,label:d.name}))} />
            </Field>
            <Field label="Date *"><Input type="date" value={form.date} onChange={v=>F("date",v)} /></Field>
            <Field label="Time *"><Input type="time" value={form.time} onChange={v=>F("time",v)} /></Field>
            <Field label="Type">
              <Select value={form.type} onChange={v=>F("type",v)} options={APPT_TYPES} />
            </Field>
            {auth?.role !== "Patient" && (
              <Field label="Status">
                <Select value={form.status} onChange={v=>F("status",v)} options={["Scheduled","Completed","Cancelled"]} />
              </Field>
            )}
          </div>
          <Field label="Notes">
            <textarea value={form.notes} onChange={e=>F("notes",e.target.value)}
              placeholder="Reason for appointment…"
              style={{ ...INPUT_STYLE, height:80, resize:"vertical" }} />
          </Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn variant="secondary" onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving?"Saving…":"Schedule"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
