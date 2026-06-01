import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Card, Btn, Field, Input, Select, Modal, TH, TD, Chip, PageHeader, Empty, Spinner, Avatar, T, INPUT_STYLE } from "../common/UI";

export default function Billing() {
  const { auth, bills, patients, addBill, updateBill, deleteBill, loading } = useApp();
  const [modal,  setModal]  = useState(null); // null | "add" | "view"
  const [sel,    setSel]    = useState(null);
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    patientId:"", date:today, items:[{name:"",amt:""}],
  });

  const paidTotal    = bills.filter(b=>b.status==="Paid").reduce((s,b)=>s+b.items.reduce((a,i)=>a+i.amt,0),0);
  const pendingTotal = bills.filter(b=>b.status==="Pending").reduce((s,b)=>s+b.items.reduce((a,i)=>a+i.amt,0),0);
  const formTotal    = form.items.reduce((s,it)=>s+(Number(it.amt)||0),0);

  function updateItem(idx,key,val) {
    setForm(f=>({...f, items:f.items.map((it,i)=>i===idx?{...it,[key]:val}:it)}));
  }
  function addItem()    { setForm(f=>({...f,items:[...f.items,{name:"",amt:""}]})); }
  function removeItem(i){ setForm(f=>({...f,items:f.items.filter((_,x)=>x!==i)})); }

  function openAdd() {
    setForm({ patientId:patients[0]?._id||"", date:today, items:[{name:"Consultation",amt:"1500"}] });
    setModal("add");
  }

  async function handleSave() {
    if (!form.patientId||form.items.some(it=>!it.name.trim()||!it.amt)) return;
    setSaving(true);
    try {
      await addBill({ ...form, items: form.items.map(it=>({...it,amt:Number(it.amt)})) });
      setModal(null);
    } finally {
      setSaving(false);
    }
  }

  async function markPaid(id) {
    await updateBill(id, { status:"Paid" });
  }

  async function handleDelete(id) {
    if (!confirm("Delete this bill?")) return;
    await deleteBill(id);
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Billing"
        subtitle={`${bills.length} total · ${bills.filter(b=>b.status==="Pending").length} pending`}
        action={auth?.role === "Admin" && <Btn onClick={openAdd}>+ Create Bill</Btn>}
      />

      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Total Collected", value:`₹${paidTotal.toLocaleString()}`,    icon:"💰", color:"#10b981" },
          { label:"Pending Amount",  value:`₹${pendingTotal.toLocaleString()}`,  icon:"⏳", color:"#f59e0b" },
          { label:"Total Bills",     value:bills.length,                          icon:"📋", color:"#3b82f6" },
        ].map(s=>(
          <Card key={s.label} style={{ display:"flex", alignItems:"center", gap:16 }}>
            <span style={{ fontSize:32 }}>{s.icon}</span>
            <div>
              <p style={{ margin:0, fontWeight:800, fontSize:22, color:s.color }}>{s.value}</p>
              <p style={{ margin:"2px 0 0", fontSize:13, color:T.muted }}>{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              {(auth?.role === "Admin"
                ? ["Patient","Date","Items","Total","Status","Actions"]
                : ["Patient","Date","Items","Total","Status"]
              ).map(h=><TH key={h}>{h}</TH>)}
            </tr>
          </thead>
          <tbody>
            {bills.map((b,i)=>{
              const pName = b.patientId?.name||"—";
              const total = b.items?.reduce((s,it)=>s+it.amt,0)||0;
              return (
                <tr key={b._id} style={{ borderBottom:`1px solid ${T.border}`, background:i%2===0?"white":"#fafbfd" }}>
                  <TD>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <Avatar name={pName} size={32} radius={8} />
                      <span style={{ fontWeight:600, color:T.text }}>{pName}</span>
                    </div>
                  </TD>
                  <TD style={{ color:T.muted }}>
                    {b.date ? new Date(b.date).toLocaleDateString("en-IN") : "—"}
                  </TD>
                  <TD>
                    <button onClick={()=>{ setSel(b); setModal("view"); }}
                      style={{ background:"none", border:"none", cursor:"pointer",
                        color:T.teal, fontSize:13, fontWeight:600, padding:0 }}>
                      {b.items?.length||0} item{b.items?.length!==1?"s":""}
                    </button>
                  </TD>
                  <TD>
                    <span style={{ fontWeight:800, fontSize:15,
                      color:b.status==="Paid"?"#10b981":"#f59e0b" }}>
                      ₹{total.toLocaleString()}
                    </span>
                  </TD>
                  <TD><Chip label={b.status} /></TD>
                  {auth?.role === "Admin" && (
                    <TD>
                      <div style={{ display:"flex", gap:6 }}>
                        {b.status==="Pending" && <Btn small onClick={()=>markPaid(b._id)}>Mark Paid</Btn>}
                        <Btn small variant="danger" onClick={()=>handleDelete(b._id)}>Delete</Btn>
                      </div>
                    </TD>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {bills.length===0 && <Empty message="No bills created yet." />}
      </Card>

      {/* Create Bill */}
      {modal==="add" && (
        <Modal title="Create New Bill" onClose={()=>setModal(null)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
            <Field label="Patient *">
              <Select value={form.patientId} onChange={v=>setForm(f=>({...f,patientId:v}))}
                options={patients.map(p=>({value:p._id,label:p.name}))} />
            </Field>
            <Field label="Date">
              <Input type="date" value={form.date} onChange={v=>setForm(f=>({...f,date:v}))} />
            </Field>
          </div>

          <Field label="Bill Items *">
            {form.items.map((item,idx)=>(
              <div key={idx} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"center" }}>
                <input value={item.name} onChange={e=>updateItem(idx,"name",e.target.value)}
                  placeholder="Service / Item" style={{ ...INPUT_STYLE, flex:2 }} />
                <input type="number" value={item.amt} onChange={e=>updateItem(idx,"amt",e.target.value)}
                  placeholder="₹ Amount" style={{ ...INPUT_STYLE, flex:1 }} />
                {form.items.length>1 && (
                  <button onClick={()=>removeItem(idx)}
                    style={{ background:"#fee2e2", color:"#dc2626", border:"none",
                      borderRadius:7, padding:"8px 10px", cursor:"pointer", fontWeight:700, flexShrink:0 }}>
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button onClick={addItem}
              style={{ background:"none", border:`1.5px dashed ${T.teal}`, color:T.teal,
                borderRadius:8, padding:"8px 0", cursor:"pointer", fontSize:13,
                fontWeight:600, width:"100%", marginTop:4 }}>
              + Add Line Item
            </button>
          </Field>

          <div style={{ background:"#f0fdf9", border:`1px solid ${T.tealLight}`,
            borderRadius:10, padding:"12px 16px", marginBottom:16,
            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ color:T.text, fontWeight:600 }}>Total Amount</span>
            <span style={{ fontWeight:800, fontSize:20, color:T.teal }}>₹{formTotal.toLocaleString()}</span>
          </div>

          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn variant="secondary" onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving?"Creating…":"Create Bill"}</Btn>
          </div>
        </Modal>
      )}

      {/* View Bill */}
      {modal==="view" && sel && (
        <Modal title="Bill Details" onClose={()=>setModal(null)} width={420}>
          <div style={{ marginBottom:18 }}>
            <p style={{ margin:0, fontWeight:700, fontSize:16, color:T.text }}>
              {sel.patientId?.name||"Unknown Patient"}
            </p>
            <p style={{ margin:"4px 0 0", color:T.muted, fontSize:13 }}>
              Bill Date: {sel.date?new Date(sel.date).toLocaleDateString("en-IN"):"—"}
            </p>
          </div>
          {sel.items?.map((item,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between",
              padding:"10px 0", borderBottom:`1px solid ${T.border}`, fontSize:14 }}>
              <span style={{ color:T.text }}>{item.name}</span>
              <span style={{ fontWeight:600 }}>₹{item.amt.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ display:"flex", justifyContent:"space-between",
            padding:"14px 0", fontSize:17, fontWeight:800, color:T.teal }}>
            <span>Total</span>
            <span>₹{sel.items?.reduce((s,i)=>s+i.amt,0).toLocaleString()}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <Chip label={sel.status} />
            <div style={{ display:"flex", gap:8 }}>
              <Btn variant="secondary" onClick={()=>setModal(null)}>Close</Btn>
              {sel.status==="Pending" && auth?.role === "Admin" && (
                <Btn onClick={()=>{ markPaid(sel._id); setModal(null); }}>Mark as Paid</Btn>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
