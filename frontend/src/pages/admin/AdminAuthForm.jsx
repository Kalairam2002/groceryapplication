import React, { useState } from "react";
import "./AdminAuth.css";
import { useNavigate } from "react-router-dom";

const AdminAuthForm = () => {
const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");
  const [step, setStep] = useState("register"); // "register" or "otp"
  const [loginData, setLoginData] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  // Forgot password states
  const [forgotStep, setForgotStep] = useState("email"); 
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleInputChange = (e, type) => {
    const { name, value } = e.target;
    if (type === "login") setLoginData({ ...loginData, [name]: value });
    else setRegisterData({ ...registerData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      setMessage(data.message || (data.success ? "Login Successful!" : ""));
      setLoginData({ identifier: "", password: "" });
      if (data.success) {
    localStorage.setItem("admin", JSON.stringify(data.admin));
    localStorage.setItem("adminToken", data.token);
    navigate("/adminProductList");
}
    } catch {
      setMessage("Something went wrong!");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(registerData),
      });
      const data = await res.json();
      setMessage(data.message || "OTP sent to your email.");
      if (data.success) {
        setStep("otp"); // show OTP card
      }
    } catch {
      setMessage("Something went wrong!");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: registerData.email, otp }),
      });
      const data = await res.json();
      setMessage(data.message || "OTP verified.");
      if (data.success) {
        setRegisterData({ name: "", email: "", password: "" });
        setOtp("");
        setStep("register");
        setActiveTab("login");
      }
    } catch {
      setMessage("OTP verification failed!");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      setMessage(data.message || "Reset link sent to your email.");
      if (data.success) {
        setForgotStep("reset");
      }
    } catch {
      setMessage("Failed to send reset link.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/reset-password/${forgotEmail}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });
      const data = await res.json();
      setMessage(data.message || "Password updated.");
      if (data.success) {
        setForgotStep("email");
        setActiveTab("login");
        setNewPassword("");
        setConfirmPassword("");
        setForgotEmail("");
      }
    } catch {
      setMessage("Failed to reset password.");
    }
  };

  return (
    <div className="container-fluid image-banner">
      <div className="auth-card">
        <h2 className="auth-title">
          {activeTab === "login"
            ? "Admin Login"
            : activeTab === "forgot"
            ? "Forgot Password"
            : "Admin Registration"}
        </h2>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("login");
              setMessage("");
              setStep("register");
            }}
          >
            Login
          </button>
          <button
            className={`auth-tab ${activeTab === "register" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("register");
              setMessage("");
              setStep("register");
            }}
          >
            Register
          </button>
        </div>

        {/* LOGIN FORM */}
        {activeTab === "login" && (
          // <form className="auth-form" onSubmit={handleLogin}>
          //   <input
          //     type="text"
          //     placeholder="Username"
          //     name="identifier"
          //     value={loginData.identifier}
          //     onChange={(e) => handleInputChange(e, "login")}
          //     required
          //   />

          //   <input
          //     type="password"
          //     placeholder="Password"
          //     name="password"
          //     value={loginData.password}
          //     onChange={(e) => handleInputChange(e, "login")}
          //     required
          //   />

          //   {/* Forgot password link */}
          //   <div style={{ textAlign: "left", marginBottom: "10px" }}>
          //     <button
          //       type="button"
          //       onClick={() => {
          //         setActiveTab("forgot");
          //         setForgotStep("email");
          //         setMessage("");
          //       }}
          //       style={{
          //         background: "none",
          //         border: "none",
          //         color: "#000000",
          //         fontSize: "14px",
          //         cursor: "pointer",
          //         textDecoration: "underline",
          //         padding: 0,
          //       }}
          //     >
          //       Forgot password?
          //     </button>
          //   </div>

          //   <button type="submit" className="auth-btn">
          //     Login
          //   </button>
          // </form>
          <form className="auth-form" onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="Username"
        name="identifier"
        value={loginData.identifier}
        onChange={(e) => handleInputChange(e, "login")}
        required
      />

      {/* Password Field with Eye Icon */}
  <div style={{ position: "relative" }}>
    <input
      type={showPassword ? "text" : "password"}
      placeholder="Password"
      name="password"
      value={loginData.password}
      onChange={(e) => handleInputChange(e, "login")}
      required
      style={{
        width: "100%",
        paddingRight: "42px",
      }}
    />

    <i
      className={`ph ${showPassword ? "ph-eye-slash" : "ph-eye"}`}
      onClick={() => setShowPassword(!showPassword)}
      style={{
        position: "absolute",
        right: "14px",
        top: "40%",
        transform: "translateY(-50%)",
        cursor: "pointer",
        fontSize: "18px",
        color: "#555",
      }}
    />
  </div>

      {/* Forgot password link */}
      <div style={{ textAlign: "left", marginBottom: "10px" }}>
        <button
          type="button"
          onClick={() => {
            setActiveTab("forgot");
            setForgotStep("email");
            setMessage("");
          }}
          style={{
            background: "none",
            border: "none",
            color: "#000000",
            fontSize: "14px",
            cursor: "pointer",
            textDecoration: "underline",
            padding: 0,
          }}
        >
          Forgot password?
        </button>
      </div>

      <button type="submit" className="auth-btn">
        Login
      </button>
    </form>
        )}

        {/* REGISTER FORM */}
        {activeTab === "register" && step === "register" && (
          <form className="auth-form" onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Full Name"
              name="name"
              value={registerData.name}
              onChange={(e) => handleInputChange(e, "register")}
              required
            />
            
            <input
              type="email"
              placeholder="Email Address"
              name="email"
              value={registerData.email}
              onChange={(e) => handleInputChange(e, "register")}
              required
            />
            <div style={{ position: "relative" }}>
             <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              name="password"
              value={registerData.password}
              onChange={(e) => handleInputChange(e, "register")}
              required
              style={{
        width: "100%",
        paddingRight: "42px",
      }}
            />

    <i
      className={`ph ${showPassword ? "ph-eye-slash" : "ph-eye"}`}
      onClick={() => setShowPassword(!showPassword)}
      style={{
        position: "absolute",
        right: "14px",
        top: "40%",
        transform: "translateY(-50%)",
        cursor: "pointer",
        fontSize: "18px",
        color: "#555",
      }}
    />
            </div>
           
            <button type="submit" className="auth-btn register-btn">
              Register
            </button>
          </form>
        )}

        {/* OTP FORM */}
        {activeTab === "register" && step === "otp" && (
          <form className="auth-form" onSubmit={handleOtpSubmit}>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button type="submit" className="auth-btn">
              Verify OTP
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD EMAIL FORM */}
        {activeTab === "forgot" && forgotStep === "email" && (
          <form className="auth-form" onSubmit={handleForgotPassword}>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />
            <button type="submit" className="auth-btn">
              Send Reset Link
            </button>
          </form>
        )}

               {/* FORGOT PASSWORD RESET FORM */}
               {activeTab === "forgot" && forgotStep === "reset" && (
          <form className="auth-form" onSubmit={handleResetPassword}>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" className="auth-btn">
              Change My Password
            </button>
          </form>
        )}

        {message && <p className="auth-message">{message}</p>}
      </div>
    </div>
  );
};

export default AdminAuthForm;

