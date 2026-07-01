import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function DeliveryResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: "Passwords do not match!", type: "error" });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ text: "Password must be at least 6 characters!", type: "error" });
      return;
    }
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/delivery/reset-password/${token}`,
        { newPassword, confirmPassword }
      );
      setMessage({ text: data.message, type: "success" });
      setTimeout(() => navigate("/delivery/login"), 2000);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Something went wrong", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getStrength = () => {
    if (newPassword.length === 0) return { label: "", color: "" };
    if (newPassword.length < 4) return { label: "Weak", color: "#ef4444" };
    if (newPassword.length < 6) return { label: "Fair", color: "#f59e0b" };
    if (newPassword.length < 9) return { label: "Good", color: "#3b82f6" };
    return { label: "Strong", color: "#22c55e" };
  };

  const strength = getStrength();

  return (
    <div style={styles.page}>
      <div style={styles.overlay} />

      <div style={styles.card}>

        {/* Icon */}
        <div style={styles.iconWrapper}>
          <span style={{ fontSize: "36px" }}>🔐</span>
        </div>

        <h2 style={styles.title}>Reset Password</h2>
        <p style={styles.subtitle}>Set a new password for your delivery account</p>

        {/* Message */}
        {message.text && (
          <div style={{
            ...styles.message,
            background: message.type === "success" ? "#d4edda" : "#f8d7da",
            color: message.type === "success" ? "#155724" : "#721c24",
          }}>
            {message.type === "success" ? "✅ " : "❌ "}{message.text}
          </div>
        )}

        <form onSubmit={handleReset} style={styles.form}>

          {/* New Password */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>New Password</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={styles.input}
                required
              />
              <span onClick={() => setShowNew(!showNew)} style={styles.eyeIcon}>
                {showNew ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          {/* Password Strength */}
          {newPassword.length > 0 && (
            <div style={{ marginTop: "-8px" }}>
              <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{
                    flex: 1, height: "4px", borderRadius: "2px",
                    background: newPassword.length >= i * 2 ? strength.color : "rgba(255,255,255,0.2)",
                    transition: "background 0.3s",
                  }} />
                ))}
              </div>
              <p style={{ color: strength.color, fontSize: "12px", margin: 0, fontWeight: "600" }}>
                {strength.label} password
              </p>
            </div>
          )}

          {/* Confirm Password */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Confirm Password</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  ...styles.input,
                  border: confirmPassword && confirmPassword !== newPassword
                    ? "2px solid #ef4444"
                    : confirmPassword && confirmPassword === newPassword
                    ? "2px solid #22c55e"
                    : "none",
                }}
                required
              />
              <span onClick={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
                {showConfirm ? "🙈" : "👁️"}
              </span>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p style={{ color: "#ef4444", fontSize: "12px", margin: "4px 0 0", fontWeight: "600" }}>
                ❌ Passwords do not match
              </p>
            )}
            {confirmPassword && confirmPassword === newPassword && (
              <p style={{ color: "#22c55e", fontSize: "12px", margin: "4px 0 0", fontWeight: "600" }}>
                ✅ Passwords match
              </p>
            )}
          </div>

          <button style={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? "Updating..." : "Change My Password"}
          </button>

          <button type="button" onClick={() => navigate("/delivery/login")}
            style={{ ...styles.submitBtn, background: "rgba(255,255,255,0.2)", marginTop: "4px" }}>
            Back to Login
          </button>

        </form>
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
  overlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" },
  card: {
    position: "relative", zIndex: 1,
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    borderRadius: "16px", padding: "40px 36px",
    width: "100%", maxWidth: "420px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  iconWrapper: {
    width: "70px", height: "70px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "50%", display: "flex",
    alignItems: "center", justifyContent: "center",
    margin: "0 auto 16px",
  },
  title: { textAlign: "center", color: "#fff", fontSize: "24px", fontWeight: "700", margin: "0 0 8px" },
  subtitle: { textAlign: "center", color: "rgba(255,255,255,0.75)", fontSize: "14px", margin: "0 0 24px" },
  message: { padding: "10px 14px", borderRadius: "8px", fontSize: "14px", marginBottom: "16px", textAlign: "center", fontWeight: "500" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { color: "rgba(255,255,255,0.9)", fontSize: "13px", fontWeight: "600" },
  passwordWrapper: { position: "relative", display: "flex", alignItems: "center" },
  input: { width: "100%", padding: "14px 16px", borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.85)", fontSize: "15px", color: "#222", outline: "none", boxSizing: "border-box" },
  eyeIcon: { position: "absolute", right: "14px", cursor: "pointer", fontSize: "18px" },
  submitBtn: { width: "100%", padding: "14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "background 0.2s" },
};