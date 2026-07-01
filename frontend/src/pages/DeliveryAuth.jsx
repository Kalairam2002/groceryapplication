import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = `${process.env.REACT_APP_API_URL}/api/delivery`;

export default function DeliveryAuth() {
  const [tab, setTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ emailOrPhone: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", phone: "", password: "" });

  //  Forgot password states
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // LOGIN 
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const { data } = await axios.post(`${API}/login`, loginForm, { withCredentials: true });
      setMessage({ text: data.message, type: "success" });
      localStorage.setItem("deliveryToken", data.token);
      localStorage.setItem("deliveryBoy", JSON.stringify(data.data));
      setTimeout(() => navigate("/delivery/dashboard"), 1000);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Login failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // REGISTER 
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const { data } = await axios.post(`${API}/register`, registerForm);
      setOtpEmail(registerForm.email);
      setShowOtp(true);
      setMessage({ text: data.message, type: "success" });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Registration failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // VERIFY OTP 
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const { data } = await axios.post(`${API}/verify-otp`, { email: otpEmail, otp });
      setMessage({ text: data.message, type: "success" });
      setTimeout(() => {
        setShowOtp(false);
        setTab("login");
        setMessage({ text: "", type: "" });
      }, 2000);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "OTP verification failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  //  FORGOT PASSWORD
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const { data } = await axios.post(`${API}/forgot-password`, { email: forgotEmail });
      setMessage({ text: data.message, type: "success" });
      setForgotSent(true);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to send reset link", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.overlay} />

      <div style={styles.card}>
        <h2 style={styles.title}>Delivery Boy Portal</h2>

        {/* Tab Buttons — hide on forgot tab */}
        {tab !== "forgot" && (
          <div style={styles.tabRow}>
            <button
              onClick={() => { setTab("login"); setMessage({ text: "", type: "" }); setShowOtp(false); }}
              style={{ ...styles.tabBtn, ...(tab === "login" ? styles.tabActive : {}) }}
            >
              Login
            </button>
            <button
              onClick={() => { setTab("register"); setMessage({ text: "", type: "" }); setShowOtp(false); }}
              style={{ ...styles.tabBtn, ...(tab === "register" ? styles.tabActive : {}) }}
            >
              Register
            </button>
          </div>
        )}

        {/* Message */}
        {message.text && (
          <div style={{
            ...styles.message,
            background: message.type === "success" ? "#d4edda" : "#f8d7da",
            color: message.type === "success" ? "#155724" : "#721c24"
          }}>
            {message.text}
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === "login" && (
          <form onSubmit={handleLogin} style={styles.form}>
            <input
              style={styles.input}
              type="text"
              placeholder="Email or Mobile Number"
              value={loginForm.emailOrPhone}
              onChange={(e) => setLoginForm({ ...loginForm, emailOrPhone: e.target.value })}
              required
            />
            <div style={styles.passwordWrapper}>
              <input
                style={{ ...styles.input, marginBottom: 0 }}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
              <span onClick={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            {/*  Forgot Password Link */}
            <div style={{ textAlign: "right", marginTop: "-6px" }}>
              <button
                type="button"
                onClick={() => {
                  setTab("forgot");
                  setMessage({ text: "", type: "" });
                  setForgotSent(false);
                  setForgotEmail("");
                }}
                style={{
                  background: "none", border: "none",
                  color: "#fff", fontSize: "13px",
                  cursor: "pointer", textDecoration: "underline",
                }}
              >
                Forgot password?
              </button>
            </div>

            <button style={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {tab === "register" && !showOtp && (
          <form onSubmit={handleRegister} style={styles.form}>
            <input style={styles.input} type="text" placeholder="Full Name"
              value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} required />
            <input style={styles.input} type="email" placeholder="Email Address"
              value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} required />
            <input style={styles.input} type="tel" placeholder="Mobile Number"
              value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} required />
            <div style={styles.passwordWrapper}>
              <input
                style={{ ...styles.input, marginBottom: 0 }}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                required
              />
              <span onClick={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
            <button style={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : "Register"}
            </button>
          </form>
        )}

        {/* OTP CARD */}
        {tab === "register" && showOtp && (
          <form onSubmit={handleVerifyOtp} style={styles.form}>
            <div style={{
              background: "rgba(255,255,255,0.1)", borderRadius: "10px",
              padding: "16px", textAlign: "center", marginBottom: "8px",
            }}>
              <p style={{ color: "#fff", fontSize: "14px", margin: "0 0 4px" }}>OTP sent to</p>
              <p style={{ color: "#90EE90", fontSize: "15px", fontWeight: "700", margin: 0 }}>{otpEmail}</p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", margin: "6px 0 0" }}>Valid for 10 minutes</p>
            </div>
            <input
              style={{ ...styles.input, textAlign: "center", fontSize: "22px", letterSpacing: "8px", fontWeight: "700" }}
              type="text" placeholder="Enter OTP" value={otp}
              onChange={(e) => setOtp(e.target.value)} maxLength={6} required
            />
            <button style={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button type="button"
              onClick={() => { setShowOtp(false); setOtp(""); setMessage({ text: "", type: "" }); }}
              style={{ ...styles.submitBtn, background: "rgba(255,255,255,0.2)", marginTop: "4px" }}>
              Back to Register
            </button>
          </form>
        )}

        {/*  FORGOT PASSWORD FORM */}
        {tab === "forgot" && !forgotSent && (
          <form onSubmit={handleForgotPassword} style={styles.form}>
            <div style={{ textAlign: "center", marginBottom: "4px" }}>
              <div style={{ fontSize: "40px", marginBottom: "8px" }}>🔐</div>
              <p style={{ color: "#fff", fontSize: "15px", margin: "0 0 4px", fontWeight: "600" }}>
                Forgot Password?
              </p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", margin: 0 }}>
                Enter your registered email to receive a reset link
              </p>
            </div>
            <input
              style={styles.input}
              type="email"
              placeholder="Enter your registered email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />
            <button style={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <button type="button"
              onClick={() => { setTab("login"); setMessage({ text: "", type: "" }); }}
              style={{ ...styles.submitBtn, background: "rgba(255,255,255,0.2)", marginTop: "4px" }}>
              Back to Login
            </button>
          </form>
        )}

        {/*  FORGOT PASSWORD SUCCESS */}
        {tab === "forgot" && forgotSent && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "50px", marginBottom: "16px" }}>📧</div>
            <p style={{ color: "#90EE90", fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>
              Reset link sent!
            </p>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", marginBottom: "20px" }}>
              Check your email <b style={{ color: "#fff" }}>{forgotEmail}</b> and click the reset link to set a new password.
            </p>
            <button
              onClick={() => { setTab("login"); setMessage({ text: "", type: "" }); setForgotSent(false); }}
              style={styles.submitBtn}>
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundImage: `url("https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    fontFamily: "'Segoe UI', sans-serif",
  },
  overlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" },
  card: {
    position: "relative", zIndex: 1,
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    borderRadius: "16px", padding: "40px 36px",
    width: "100%", maxWidth: "420px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  title: { textAlign: "center", color: "#fff", fontSize: "24px", fontWeight: "700", marginBottom: "20px", letterSpacing: "0.5px" },
  tabRow: { display: "flex", background: "rgba(255,255,255,0.1)", borderRadius: "30px", padding: "4px", marginBottom: "20px" },
  tabBtn: { flex: 1, padding: "8px 0", border: "none", background: "transparent", color: "#fff", fontWeight: "600", fontSize: "14px", borderRadius: "30px", cursor: "pointer", transition: "all 0.2s" },
  tabActive: { background: "#2563eb", color: "#fff", boxShadow: "0 2px 8px rgba(37,99,235,0.4)" },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  input: { width: "100%", padding: "14px 16px", borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.85)", fontSize: "15px", color: "#222", outline: "none", boxSizing: "border-box" },
  passwordWrapper: { position: "relative", display: "flex", alignItems: "center" },
  eyeIcon: { position: "absolute", right: "14px", cursor: "pointer", fontSize: "18px" },
  submitBtn: { width: "100%", padding: "14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer", marginTop: "4px", transition: "background 0.2s" },
  message: { padding: "10px 14px", borderRadius: "8px", fontSize: "14px", marginBottom: "10px", textAlign: "center", fontWeight: "500" },
};