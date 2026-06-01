// ─── Design Tokens ─────────────────────────────────────────────────────────
export const T = {
  navy:      "#0f172a",
  navyMid:   "#1e293b",
  teal:      "#0d9488",
  tealLight: "#ccfbf1",
  bg:        "#f1f5f9",
  white:     "#ffffff",
  border:    "#e2e8f0",
  text:      "#1e293b",
  muted:     "#64748b",
};

export const INPUT_STYLE = {
  width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`,
  borderRadius: 8, fontSize: 14, color: T.text, background: "white",
  boxSizing: "border-box", outline: "none", fontFamily: "inherit",
};

const STATUS_STYLE = {
  Active:     { bg:"#dcfce7", fg:"#15803d" },
  "On Leave": { bg:"#fef9c3", fg:"#a16207" },
  Admitted:   { bg:"#dbeafe", fg:"#1d4ed8" },
  Outpatient: { bg:"#e0f2fe", fg:"#0369a1" },
  Discharged: { bg:"#f3f4f6", fg:"#4b5563" },
  Scheduled:  { bg:"#ede9fe", fg:"#6d28d9" },
  Completed:  { bg:"#dcfce7", fg:"#15803d" },
  Cancelled:  { bg:"#fee2e2", fg:"#b91c1c" },
  Paid:       { bg:"#dcfce7", fg:"#15803d" },
  Pending:    { bg:"#fef9c3", fg:"#a16207" },
};

// ─── Chip / Badge ────────────────────────────────────────────────────────────
export function Chip({ label }) {
  const s = STATUS_STYLE[label] || { bg:"#f3f4f6", fg:"#374151" };
  return (
    <span style={{ background:s.bg, color:s.fg, fontSize:11, fontWeight:700,
      padding:"3px 10px", borderRadius:20, letterSpacing:"0.03em", whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return (
    <div style={{ background:T.white, border:`1px solid ${T.border}`,
      borderRadius:12, padding:20, ...style }}>
      {children}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant="primary", small, disabled, style }) {
  const V = {
    primary:   { background:T.teal,    color:"white",  border:"none" },
    danger:    { background:"#ef4444", color:"white",  border:"none" },
    ghost:     { background:"transparent", color:T.muted, border:`1px solid ${T.border}` },
    secondary: { background:"#f1f5f9", color:T.text,  border:`1px solid ${T.border}` },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...V[variant], padding: small ? "6px 13px" : "9px 18px",
        borderRadius:8, fontSize: small ? 12 : 14, fontWeight:600,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
        transition:"opacity 0.15s", ...style }}
      onMouseOver={e => !disabled && (e.currentTarget.style.opacity = "0.82")}
      onMouseOut={e  => !disabled && (e.currentTarget.style.opacity = "1")}
    >{children}</button>
  );
}

// ─── Form Fields ─────────────────────────────────────────────────────────────
export function Field({ label, children }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:600, color:T.muted,
        marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function Input({ value, onChange, placeholder, type="text" }) {
  return (
    <input type={type} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)} style={INPUT_STYLE} />
  );
}

export function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ ...INPUT_STYLE, appearance:"auto" }}>
      <option value="">— Select —</option>
      {options.map(o => {
        const val = typeof o === "object" ? o.value : o;
        const lbl = typeof o === "object" ? o.label : o;
        return <option key={val} value={val}>{lbl}</option>;
      })}
    </select>
  );
}

// ─── Table helpers ────────────────────────────────────────────────────────────
export function TH({ children }) {
  return (
    <th style={{ padding:"12px 16px", textAlign:"left", fontWeight:600, color:T.muted,
      fontSize:11, letterSpacing:"0.06em", textTransform:"uppercase",
      borderBottom:`1px solid ${T.border}`, background:"#f8fafc", whiteSpace:"nowrap" }}>
      {children}
    </th>
  );
}

export function TD({ children, style }) {
  return <td style={{ padding:"13px 16px", fontSize:14, ...style }}>{children}</td>;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name="?", bg="#ccfbf1", fg="#0d9488", size=36, radius=10 }) {
  const initials = (name || "?").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
  return (
    <div style={{ width:size, height:size, borderRadius:radius, background:bg,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontWeight:700, fontSize:size*0.36, color:fg, flexShrink:0 }}>
      {initials}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, width=540 }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:1000, padding:16 }}>
      <div style={{ background:T.white, borderRadius:16, width:"100%",
        maxWidth:width, maxHeight:"90vh", overflowY:"auto",
        boxShadow:"0 24px 64px rgba(0,0,0,0.28)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"20px 24px", borderBottom:`1px solid ${T.border}` }}>
          <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:T.text }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none",
            fontSize:20, cursor:"pointer", color:T.muted, padding:"2px 6px" }}>✕</button>
        </div>
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ msg, type="success" }) {
  return (
    <div style={{ position:"fixed", bottom:28, right:28,
      background: type==="success" ? T.teal : "#ef4444",
      color:"white", padding:"13px 22px", borderRadius:12, fontSize:14,
      fontWeight:600, zIndex:9999, boxShadow:"0 6px 24px rgba(0,0,0,0.22)",
      display:"flex", alignItems:"center", gap:8 }}>
      <span>{type==="success" ? "✓" : "✕"}</span> {msg}
    </div>
  );
}

// ─── Loading spinner ──────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", padding:60, gap:16 }}>
      <div style={{ width:40, height:40, border:`4px solid ${T.border}`,
        borderTopColor:T.teal, borderRadius:"50%",
        animation:"spin 0.8s linear infinite" }} />
      <p style={{ color:T.muted, fontSize:14 }}>Loading data…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── Page Header ──────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
      <div>
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:T.text }}>{title}</h1>
        {subtitle && <p style={{ margin:"4px 0 0", color:T.muted, fontSize:14 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Search bar ───────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder }) {
  return (
    <Card style={{ padding:"12px 16px", marginBottom:16 }}>
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder || "🔍  Search…"}
        style={{ ...INPUT_STYLE, border:"none", outline:"none",
          fontSize:14, width:"100%", padding:4 }} />
    </Card>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
export function Empty({ message="No results found." }) {
  return (
    <div style={{ textAlign:"center", padding:"40px 20px" }}>
      <p style={{ fontSize:32, marginBottom:8 }}>🔍</p>
      <p style={{ color:T.muted, fontSize:14 }}>{message}</p>
    </div>
  );
}
