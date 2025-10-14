import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Account = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); 
  const [otp, setOtp] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", email: "", password: "" });

  // OTP Verification
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/user/verify-otp`, {
        email: registerData.email,
        otp,
      });
      toast.success("Registration complete");
      navigate("/"); // redirect to homepage or login
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    }
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/user/login`, loginData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success(res.data.message);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  // Register
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/user/register`, registerData);
      toast.success("OTP sent to your email");
      setStep(2); // move to OTP step
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <section className="account py-80">
      <div className="container container-lg">
        <div className="row gy-4">
          {/* Login Card */}
          <div className="col-xl-6 pe-xl-5">
            <form onSubmit={handleLogin} className="border border-gray-100 hover-border-main-600 transition-1 rounded-16 px-24 py-40 h-100">
              <h6 className="text-xl mb-32">Login</h6>
              <div className="mb-24">
                <label htmlFor="loginEmail" className="text-neutral-900 text-lg mb-8 fw-medium">Email <span className="text-danger">*</span></label>
                <input
                  type="email"
                  id="loginEmail"
                  className="common-input"
                  placeholder="Enter Email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>
              <div className="mb-24">
                <label htmlFor="loginPassword" className="text-neutral-900 text-lg mb-8 fw-medium">Password</label>
                <input
                  type="password"
                  id="loginPassword"
                  className="common-input"
                  placeholder="Enter Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-main py-18 px-40">Log in</button>
            </form>
          </div>

          {/* Register Card */}
          <div className="col-xl-6">
            {step === 1 ? (
              <form onSubmit={handleRegister} className="border border-gray-100 hover-border-main-600 transition-1 rounded-16 px-24 py-40">
                <h6 className="text-xl mb-32">Register</h6>
                <div className="mb-24">
                  <label htmlFor="regUsername" className="text-neutral-900 text-lg mb-8 fw-medium">Username <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    id="regUsername"
                    className="common-input"
                    placeholder="Enter username"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-24">
                  <label htmlFor="regEmail" className="text-neutral-900 text-lg mb-8 fw-medium">Email <span className="text-danger">*</span></label>
                  <input
                    type="email"
                    id="regEmail"
                    className="common-input"
                    placeholder="Enter Email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-24">
                  <label htmlFor="regPassword" className="text-neutral-900 text-lg mb-8 fw-medium">Password <span className="text-danger">*</span></label>
                  <input
                    type="password"
                    id="regPassword"
                    className="common-input"
                    placeholder="Enter Password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-main py-18 px-40">Register</button>
              </form>
            ) : (
              <form onSubmit={handleOtpVerify} className="border border-gray-100 hover-border-main-600 transition-1 rounded-16 px-24 py-40">
                <h6 className="text-xl mb-32">Verify OTP</h6>
                <div className="mb-24">
                  <label htmlFor="otp" className="text-neutral-900 text-lg mb-8 fw-medium">OTP <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    id="otp"
                    className="common-input"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-main py-18 px-40">Verify OTP</button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </section>
  );
};

export default Account;
