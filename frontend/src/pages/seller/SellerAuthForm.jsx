import React, { useState } from "react";
import "./SellerAuth.css";
import { useNavigate } from "react-router-dom";

const SellerAuthForm = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");
  const [step, setStep] = useState("register"); // "register" or "otp"
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    phonenumber: "",
    gstnumber: "",
  });
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

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
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/seller/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      console.log("Login response:", data);
      setMessage(data.message || (data.success ? "Login Successful!" : ""));
      setLoginData({ email: "", password: "" });
      if (data.success) navigate("/selleraddproduct");
    } catch (err) {
      console.error("Login error:", err.message);
      setMessage("Something went wrong!");
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

  return (
    <div className="auth-container">
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

        {activeTab === "login" && (
          <form className="auth-form" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email Address"
              name="email"
              value={loginData.email}
              onChange={(e) => handleInputChange(e, "login")}
              required
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={loginData.password}
              onChange={(e) => handleInputChange(e, "login")}
              required
            />
            <button type="submit" className="auth-btn">
              Login
            </button>
          </form>
        )}

        {activeTab === "register" && step === "register" && (
          <form className="auth-form" onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Vendor Name"
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
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={registerData.password}
              onChange={(e) => handleInputChange(e, "register")}
              required
            />
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
            <button type="submit" className="auth-btn register-btn">
              Register
            </button>
          </form>
        )}

        {activeTab === "register" && step === "otp" && (
          <form className="auth-form" onSubmit={handleOtpVerify}>
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

        {message && <p className="auth-message">{message}</p>}
      </div>
    </div>
  );
};

export default SellerAuthForm;
