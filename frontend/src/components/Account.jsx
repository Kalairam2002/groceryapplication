import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import {auth} from "./Firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import "react-toastify/dist/ReactToastify.css";

  
  const Account = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // firebase auth codes 
  // const [phone, setPhone] = useState("");
  // const [otp1, setOtp2] = useState("");
  // const [showOtp, setShowOtp] = useState(false);

 const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  // Phone Login UI
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);


  const [phoneLogin, setPhoneLogin] = useState({
    phone: "",
    otp: "",
  });

  const [isOtpSent, setIsOtpSent] = useState(false);

  /* ===================== ADDED FORGOT PASSWORD STATES ===================== */
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
 

const sendPhoneOtp = async () => {
  try {
    if (!phoneLogin.phone) return alert("Enter phone number");
    setOtpLoading(true); 

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,                       // 👈 FIRST
        "recaptcha-container",      // 👈 SECOND
        { size: "invisible" }       // 👈 THIRD
      );
    }

    const appVerifier = window.recaptchaVerifier;

    const confirmation = await signInWithPhoneNumber(
      auth,
      "+91" + phoneLogin.phone,
      appVerifier
    );

    window.confirmationResult = confirmation;

    setIsOtpSent(true);

    toast.success("OTP Sent");

  } catch (err) {
    console.log(err);
    alert("Failed to send OTP");
  }
  finally {
    setOtpLoading(false); 
  }
};

const handlePhoneSubmit = async () => {
  try {
    const result = await window.confirmationResult.confirm(phoneLogin.otp);

    console.log(result.user);
    let phoneNumber = result.user.phoneNumber;

    if(phoneNumber.startsWith("+91")){
      phoneNumber = phoneNumber.slice(3);
    }


    const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/phone-login`, { phoneNumber });

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    toast.success("logged in successfully");

    navigate("/");
    // OPTIONAL: send to backend
    // await axios.post("/api/login", {
    //   phone: result.user.phoneNumber
    // });

  } catch (err) {
    console.log(err);
    alert("User not found. Please register first.");
    setShowPhoneLogin(false);
    setPhoneLogin({ phone: "", otp: "" });  
    
  }
};


  // OTP Verification (Email)
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/user/verify-otp`, {
        email: registerData.email,
        otp,
      });
      toast.success("Registration complete");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    }
  };

  // Login
   const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/login`,
        loginData
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success(res.data.message);
      navigate("/account");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  // Register (Email)
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/register`,
        registerData
      );
      toast.success("OTP sent to your email");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  /* ===================== FORGOT PASSWORD HANDLER ===================== */
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!forgotEmail) {
      toast.error("Please enter your email");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/forgot-password`,
        { email: forgotEmail }
      );
      toast.success("Password reset link sent to your email");
      setShowForgotPassword(false);
      setForgotEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
    }
  };
  /* =================================================================== */

  const storedUser = JSON.parse(localStorage.getItem("user"));

  if (storedUser) {
    return (
      <section className="account py-80">
        <div className="container container-lg">
          <div className="row">
  
            {/* LEFT SIDE MENU */}
            <div className="col-lg-3">
              <div className="border rounded-16 p-24">
                <h5 className="mb-24">My Dashboard</h5>
  
                <ul style={{ listStyle: "none", padding: 0 }}>
                  <li className="mb-16" style={{ cursor: "pointer" }}>
                    👤 Profile
                  </li>
  
                  <li className="mb-16" style={{ cursor: "pointer" }} onClick={() => navigate("/wishlist")}>
                            📦 My Orders
                          </li>
                </ul>

                                <ul 
                  className="mb-16" 
                  style={{ cursor: "pointer" }} 
                  onClick={() => navigate("/edit-profile")}
                >
                ✏️ Edit Profile
                </ul>


              </div>
            </div>
  
            {/* RIGHT SIDE CONTENT */}
            <div className="col-lg-9">
              <div className="border rounded-16 p-24">
                <h4 className="mb-24">
                  Welcome, {storedUser.firstName} 👋
                </h4>
  
                <div className="row">
                  <div className="col-md-6 mb-20">
                    <div className="p-20 border rounded-12">
                      <h6>Name</h6>
                      <p>{storedUser.firstName} {storedUser.lastName}</p>
                    </div>
                  </div>
  
                  <div className="col-md-6 mb-20">
                    <div className="p-20 border rounded-12">
                      <h6>Email</h6>
                      <p>{storedUser.email}</p>
                    </div>
                  </div>
  
                  {/* <div className="col-md-6 mb-20">
                    <div className="p-20 border rounded-12">
                      <h6>Phone</h6>
                      <p>{storedUser.phoneNumber || "Not Provided"}</p>
                    </div>
                  </div> */}
                </div>
  
              </div>
            </div>
  
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="account py-80">
      <div className="container container-lg">
        <div className="row gy-4">

{/* ============================ LOGIN CARD ============================ */}
<div className="col-xl-6 pe-xl-5" style={{ marginTop: "-30px" }}>
  <form
    onSubmit={handleLogin}
    className="border border-gray-100 hover-border-main-600 transition-1 rounded-16 px-24 py-40 h-70 login-form"
  >
    <h6 className="text-xl mb-32">Login</h6>

    {/* ✅ Username + Password side by side */}
    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
      {/* Username */}
      <div style={{ flex: "1 1 45%" }}>
        <label className="text-neutral-900 text-lg mb-8 fw-medium">
          Username <span className="text-danger">*</span>
        </label>
        <br />
        <input
          type="text"
          className="common-input"
          placeholder="Username"
          value={loginData.identifier}
          onChange={(e) =>
            setLoginData({ ...loginData, identifier: e.target.value })
          }
          required
          style={{
            height: "38px",
            minHeight: "38px",
            lineHeight: "38px",
            width: "100%",
            padding: "6px 12px",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Password */}
      <div style={{ flex: "1 1 45%", position: "relative" }}>
        <label className="text-neutral-900 text-lg mb-8 fw-medium">
          Password <span className="text-danger">*</span>
        </label>
        <br />
        <input
          type={showPassword ? "text" : "password"}
          className="common-input"
          placeholder="Enter Password"
          value={loginData.password}
          onChange={(e) =>
            setLoginData({ ...loginData, password: e.target.value })
          }
          required
          style={{
            height: "38px",
            minHeight: "38px",
            lineHeight: "38px",
            width: "100%",
            padding: "6px 42px 6px 12px", // space for eye icon
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        />

        {/* Eye Icon */}
        <i
          className={`ph ${showPassword ? "ph-eye-slash" : "ph-eye"}`}
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: "absolute",
            right: "12px",
            top: "55%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            fontSize: "18px",
            color: "#555",
          }}
        />

        {/* Forgot password */}
        <div style={{ textAlign: "right", marginTop: "6px" }}>
          <span
            style={{
              cursor: "pointer",
              color: "#ff6a00",
              fontSize: "14px",
            }}
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot password?
          </span>
        </div>
      </div>
    </div>

    {/* Log in button */}
    <button
      type="submit"
      className="btn btn-main py-18 px-40"
      style={{
        width: "50%",
        display: "block",
        marginTop: "20px",
      }}
    >
      Log in
    </button>

    <p className="mt-24" style={{ textAlign: "center", marginRight: "300px" }}>OR</p>

    {/* ✅ Phone login section stays exactly as before */}
    <div
      className="mt-40"
      style={{
        paddingBottom: "100px",
        marginBottom: "-80px",
      }}
    >
      <button
        type="button"
        onClick={() => setShowPhoneLogin(!showPhoneLogin)}
        className="btn btn-main w-50 py-16 px-20 mb-10"
        style={{ marginTop: "-20px" }}
      >
        Login with Phone Number
      </button>

      {showPhoneLogin && (
        <div className="animate__animated animate__fadeInDown">
          {/* Phone Number input */}
          <div className="mb-20">
            <label className="text-neutral-900 text-lg mb-8 fw-medium">
              Phone Number <span className="text-danger">*</span>
            </label>
            <br />
            <input
              type="tel"
              className="common-input"
              placeholder="+91XXXXXXXXX"
              value={phoneLogin.phone}
              onChange={(e) =>
                setPhoneLogin({ ...phoneLogin, phone: e.target.value })
              }
              style={{
                height: "38px",
                minHeight: "38px",
                lineHeight: "38px",
                width: "50%",
                padding: "6px 12px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* OTP flow unchanged */}
          {!isOtpSent && (
            <button
              type="button"
              onClick={sendPhoneOtp}
              disabled={otpLoading}
              className="btn btn-main w-50 py-16 px-20 mb-20"
            >
              {otpLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </button>
          )}

          {isOtpSent && (
            <>
              <div className="mb-24">
                <label className="text-neutral-900 text-lg mb-8 fw-medium">
                  OTP <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="common-input"
                  placeholder="Enter OTP"
                  value={phoneLogin.otp}
                  onChange={(e) =>
                    setPhoneLogin({ ...phoneLogin, otp: e.target.value })
                  }
                />
              </div>

              <button
                type="button"
                onClick={handlePhoneSubmit}
                className="btn btn-main w-100 py-16 px-20"
              >
                Submit & Login
              </button>
            </>
          )}
        </div>
      )}
    </div>

    <div id="recaptcha-container"></div>
  </form>
</div>

{/* ============================ REGISTER CARD ============================ */}
<div className="col-xl-6" style={{ marginTop: "-30px" }}>
  {step === 1 ? (
    <form
      onSubmit={handleRegister}
      className="border border-gray-100 hover-border-main-600 transition-1 rounded-16 px-24 py-40 "
    >
      <h6 className="text-xl mb-32">Register</h6>

      {/*  Wrap fields in flex container */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {/* Username */}
        <div style={{ flex: "1 1 45%" }}>
          <label className="text-neutral-900 text-lg mb-8 fw-medium">
            Username <span className="text-danger">*</span>
          </label>
          <br />
          <input
            type="text"
            className="common-input"
            placeholder="Enter username"
            value={registerData.username}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                username: e.target.value,
              })
            }
            required
            style={{
              height: "38px",
              minHeight: "38px",
              lineHeight: "38px",
              width: "100%",
              padding: "6px 15px",
              fontSize: "14px",
            }}
          />
        </div>

        {/* First Name */}
        <div style={{ flex: "1 1 45%" }}>
          <label className="text-neutral-900 text-lg mb-8 fw-medium">
            First Name <span className="text-danger">*</span>
          </label>
          <br />
          <input
            type="text"
            className="common-input"
            placeholder="Enter first name"
            value={registerData.firstName}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                firstName: e.target.value,
              })
            }
            required
            style={{
              height: "38px",
              width: "100%",
              padding: "6px 15px",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Last Name */}
        <div style={{ flex: "1 1 45%" }}>
          <label className="text-neutral-900 text-lg mb-8 fw-medium">
            Last Name <span className="text-danger">*</span>
          </label>
          <br />
          <input
            type="text"
            className="common-input"
            placeholder="Enter last name"
            value={registerData.lastName}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                lastName: e.target.value,
              })
            }
            required
            style={{
              height: "38px",
              width: "100%",
              padding: "6px 15px",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Email */}
        <div style={{ flex: "1 1 45%" }}>
          <label className="text-neutral-900 text-lg mb-8 fw-medium d-block">
            Email <span className="text-danger">*</span>
          </label>
          <input
            type="email"
            className="common-input"
            placeholder="Enter Email"
            value={registerData.email}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                email: e.target.value,
              })
            }
            required
            style={{
              height: "38px",
              minHeight: "38px",
              lineHeight: "38px",
              width: "100%",
              padding: "6px 15px",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Phone Number */}
        <div style={{ flex: "1 1 45%" }}>
          <label className="text-neutral-900 text-lg mb-8 fw-medium d-block">
            Phone Number <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            className="common-input"
            placeholder="+91XXXXXXXXXX"
            value={registerData.phoneNumber}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                phoneNumber: e.target.value,
              })
            }
            required
            style={{
              height: "38px",
              minHeight: "38px",
              lineHeight: "38px",
              width: "100%",
              padding: "6px 15px",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Password */}
        <div
          className="mb-24"
          style={{
            position: "relative",
            flex: "1 1 45%",
          }}
        >
          <label className="text-neutral-900 text-lg mb-8 fw-medium d-block">
            Password <span className="text-danger">*</span>
          </label>
          <input
            type={showPassword ? "text" : "password"}
            className="common-input"
            placeholder="Enter Password"
            value={registerData.password}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                password: e.target.value,
              })
            }
            required
            style={{
              height: "38px",
              minHeight: "38px",
              lineHeight: "38px",
              width: "100%",
              padding: "6px 42px 6px 15px", // right space for icon
              fontSize: "14px",
            }}
          />
</div>


  <i
    className={`ph ${showPassword ? "ph-eye-slash" : "ph-eye"}`}
    onClick={() => setShowPassword(!showPassword)}
    style={{
      position: "absolute",
      right: "14px",
      top: "72%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      fontSize: "18px",
      color: "#555",
    }}
  />
</div>
                <button type="submit" className="btn btn-main py-18 px-40 w-50">
                  Register
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleOtpVerify}
                className="border border-gray-100 hover-border-main-600 transition-1 rounded-16 px-24 py-40"
              >
                <h6 className="text-xl mb-32">Verify OTP</h6>

                <div className="mb-24">
                  <label className="text-neutral-900 text-lg mb-8 fw-medium">
                    OTP <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="common-input"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-main py-18 px-40">
                  Verify OTP
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ===================== FORGOT PASSWORD MODAL ===================== */}
      {showForgotPassword && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
             style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}>
          <form
            onSubmit={handleForgotPassword}
            className="bg-white rounded-16 p-32"
            style={{ width: "400px" }}
          >
            <h6 className="text-xl mb-24">Forgot Password</h6>

            <input
              type="email"
              className="common-input mb-24"
              placeholder="Enter registered email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />

            <button type="submit" className="btn btn-main w-100 mb-16">
              Send Reset Link
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={() => setShowForgotPassword(false)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
      {/* ================================================================= */}

      <ToastContainer position="top-right" autoClose={3000} />
    </section>
  );
};

export default Account;
