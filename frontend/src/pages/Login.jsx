import { useState } from "react";
import { useApp } from "../context/AppContext";
import { T, Field, Input, Btn } from "../components/common/UI";

export default function Login() {
  const { login } = useApp();
  const [role,     setRole]     = useState("Admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err,      setErr]      = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleLogin() {
    if (!username || !password) {
      setErr("Please enter both username and password.");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      await login(username, password);
    } catch (e) {
      setErr(e.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter") handleLogin();
  }

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 55%,#0d9488 100%)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif", padding:16,
    }}>
      {/* Background glow circles */}
      <div style={{ position:"fixed", top:-120, right:-120, width:400, height:400,
        borderRadius:"50%", background:"rgba(13,148,136,0.12)", pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:-80, left:-80, width:300, height:300,
        borderRadius:"50%", background:"rgba(59,130,246,0.1)", pointerEvents:"none" }} />

      <div style={{
        background:"white", borderRadius:20, padding:40,
        width:"100%", maxWidth:420, boxShadow:"0 40px 100px rgba(0,0,0,0.45)",
        position:"relative",
      }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{
            width:64, height:64, background:T.teal, borderRadius:18,
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 16px", fontSize:30, boxShadow:`0 8px 24px rgba(13,148,136,0.4)`,
          }}>🏥</div>
          <h1 style={{ margin:0, fontSize:24, fontWeight:800, color:T.text }}>CityCare Hospital</h1>
          <p style={{ margin:"6px 0 0", color:T.muted, fontSize:14 }}>Hospital Management System</p>
        </div>

        {/* Role Tabs */}
        <div style={{
          display:"flex", gap:6, marginBottom:28,
          background:"#f1f5f9", padding:4, borderRadius:12,
        }}>
          {["Admin","Doctor","Patient"].map(r => (
            <button key={r}
              onClick={() => { setRole(r); setErr(""); setUsername(""); setPassword(""); }}
              style={{
                flex:1, padding:"9px 0", borderRadius:9, border:"none",
                cursor:"pointer", fontWeight:600, fontSize:13,
                background: role===r ? T.teal : "transparent",
                color: role===r ? "white" : T.muted,
                transition:"all 0.2s",
              }}>
              {r}
            </button>
          ))}
        </div>

        {/* Fields */}
        <Field label="Username">
          <Input
            value={username}
            onChange={v => { setUsername(v); setErr(""); }}
            placeholder="Enter your username"
          />
        </Field>

        <div onKeyDown={handleKey}>
          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={v => { setPassword(v); setErr(""); }}
              placeholder="Enter your password"
            />
          </Field>
        </div>

        {/* Error */}
        {err && (
          <div style={{
            background:"#fee2e2", color:"#b91c1c", fontSize:13,
            padding:"10px 14px", borderRadius:8, marginBottom:16, fontWeight:500,
          }}>
            ⚠️ {err}
          </div>
        )}

        {/* Submit */}
        <Btn
          onClick={handleLogin}
          disabled={loading}
          style={{ width:"100%", padding:"12px", marginBottom:16, fontSize:15 }}
        >
          {loading ? "Signing in…" : "Sign In →"}
        </Btn>

        {/* Footer note */}
        <p style={{ textAlign:"center", color:T.muted, fontSize:11, marginTop:20, marginBottom:0 }}>
          CityCare Security Policy: Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  );
}
