import React, { useState } from "react";
import "./SellerAuth.css";
import { useNavigate } from "react-router-dom";

const SellerAuthForm = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");
  const [forgotStep, setForgotStep] = useState("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState("register");
  const [loginData, setLoginData] = useState({ identifier: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    phonenumber: "",
    gstnumber: "",
    address: "",
  });
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  // Login OTP flow — mirrors the registration OTP step below
  const [loginStep, setLoginStep] = useState("credentials"); // "credentials" | "otp"
  const [loginOtp, setLoginOtp] = useState("");
  const [pendingLoginIdentifier, setPendingLoginIdentifier] = useState("");

  // Keep OTP fields numeric-only, max 6 digits
  const handleOtpInput = (setter) => (e) => {
    setter(e.target.value.replace(/\D/g, "").slice(0, 6));
  };

  const handleInputChange = (e, type) => {
    const { name, value } = e.target;
    if (type === "login") {
      setLoginData({ ...loginData, [name]: value });
    } else {
      setRegisterData({ ...registerData, [name]: value });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      // NOTE: this endpoint now needs to check credentials, email an OTP,
      // and respond with { success: true } WITHOUT a token — the actual
      // login (token issuance) happens in handleLoginOtpVerify below.
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/seller/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      console.log("Login response:", data);

      if (data.success) {
        setPendingLoginIdentifier(loginData.identifier);
        setMessage(data.message || "OTP sent to your registered email.");
        setLoginStep("otp");
        setLoginData({ identifier: "", password: "" });
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err.message);
      setMessage("Something went wrong!");
    }
  };

  const handleLoginOtpVerify = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      // NOTE: assumed endpoint — adjust the path to whatever your backend
      // actually exposes for completing a login after OTP verification.
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/seller/verify-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier: pendingLoginIdentifier, otp: loginOtp }),
      });
      const data = await res.json();
      console.log("Login OTP verify response:", data);
      setMessage(data.message || (data.success ? "Login Successful!" : ""));

      if (data.success) {
        localStorage.setItem("seller", JSON.stringify(data.seller));
        localStorage.setItem("sellerToken", data.token);
        setLoginOtp("");
        setLoginStep("credentials");
        navigate("/sellerDashboard");
      }
    } catch (err) {
      console.error("Login OTP verification error:", err.message);
      setMessage("OTP verification failed!");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/seller/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(registerData),
      });
      const data = await res.json();
      console.log("Register response:", data);
      setMessage(data.message || "OTP sent to your email.");
      if (!data.success) {
        setMessage(data.message || "Registration failed");
        return;
      }
      if (data.success) {
        setStep("otp");
      }
    } catch (err) {
      console.error("Register error:", err.message);
      setMessage("Something went wrong!");
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/seller/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: registerData.email, otp }),
      });
      const data = await res.json();
      console.log("OTP verify response:", data);
      setMessage(data.message || "OTP verified.");
      if (data.success) {
        setRegisterData({
          name: "",
          email: "",
          password: "",
          phonenumber: "",
          gstnumber: "",
          address: "",
        });
        setOtp("");
        setStep("register");
        setActiveTab("login");
      }
    } catch (err) {
      console.error("OTP verification error:", err.message);
      setMessage("OTP verification failed!");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/seller/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      setMessage(data.message || "Reset link sent to your email.");
      if (data.success) {
        setForgotStep("reset");
        setResetToken(data.token);
      }
    } catch (err) {
      console.error("Forgot password error:", err.message);
      setMessage("Failed to send reset link.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/seller/reset-password/${resetToken}`, {
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
    } catch (err) {
      console.error("Reset password error:", err.message);
      setMessage("Failed to reset password.");
    }
  };

  return (
    <div className="container-fluid image-banner">
      <div className="auth-card">
        <h2 className="auth-title">
          {activeTab === "login" ? "Seller Login" : "Seller Registration"}
        </h2>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("login");
              setMessage("");
              setStep("register");
              setLoginStep("credentials");
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
              setLoginStep("credentials");
            }}
          >
            Register
          </button>
        </div>

        {activeTab === "login" && loginStep === "credentials" && (
          <form className="auth-form" onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="UserName"
              name="identifier"
              value={loginData.identifier}
              onChange={(e) => handleInputChange(e, "login")}
              required
            />
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                value={loginData.password}
                onChange={(e) => handleInputChange(e, "login")}
                required
                style={{ width: "100%", paddingRight: "42px" }}
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
            <div style={{ textAlign: "left", marginBottom: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("forgot");
                  setForgotStep("email");
                  setMessage("");
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

        {activeTab === "login" && loginStep === "otp" && (
          <form className="auth-form" onSubmit={handleLoginOtpVerify}>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 4px" }}>
              Enter the OTP sent to your registered email.
            </p>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={6}
              placeholder="Enter OTP"
              value={loginOtp}
              onChange={handleOtpInput(setLoginOtp)}
              required
            />
            <button type="submit" className="auth-btn">
              Verify OTP &amp; Login
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginStep("credentials");
                setLoginOtp("");
                setMessage("");
              }}
              style={{ background: "none", border: "none", color: "#3B4C8A", fontSize: "13px", marginTop: "10px", cursor: "pointer" }}
            >
              ← Back
            </button>
          </form>
        )}

        {activeTab === "register" && step === "register" && (
          <form className="auth-form" onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="UserName"
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
                style={{ width: "100%", paddingRight: "42px" }}
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
            <input
              type="tel"
              placeholder="Phone Number"
              name="phonenumber"
              value={registerData.phonenumber}
              onChange={(e) => handleInputChange(e, "register")}
              required
            />
            <input
              type="text"
              placeholder="GST Number"
              name="gstnumber"
              value={registerData.gstnumber}
              onChange={(e) => handleInputChange(e, "register")}
              required
            />
            <input
              type="text"
              placeholder="Address"
              name="address"
              value={registerData.address}
              onChange={(e) => handleInputChange(e, "register")}
              required
            />
            <button type="submit" className="auth-btn register-btn">
              Register
            </button>
          </form>
        )}

        {activeTab === "register" && step === "otp" && (
          <form className="auth-form" onSubmit={handleOtpVerify}>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={6}
              placeholder="Enter OTP"
              value={otp}
              onChange={handleOtpInput(setOtp)}
              required
            />
            <button type="submit" className="auth-btn">
              Verify OTP
            </button>
          </form>
        )}

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

export default SellerAuthForm;