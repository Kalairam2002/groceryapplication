import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!form.name || !form.email || !form.phone || !form.subject || !form.message) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/contact/`, form);
      toast.success(res.data.message || "Message sent successfully!");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact py-80">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container container-lg">
        <div className="row gy-5">
          {/* Left - Contact Form */}
          <div className="col-lg-8">
            <div className="contact-box border border-gray-100 rounded-16 px-24 py-40">
              <form onSubmit={handleSubmit}>
                <h6 className="mb-32">Make Custom Request</h6>
                <div className="row gy-4">
                  <div className="col-sm-6 col-xs-6">
                    <label
                      htmlFor="name"
                      className="flex-align gap-4 text-sm fw-semibold mb-4"
                    >
                      Full Name<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="common-input px-16 w-100"
                      id="name"
                      placeholder="Full name"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-6 col-xs-6">
                    <label
                      htmlFor="email"
                      className="flex-align gap-4 text-sm fw-semibold mb-4"
                    >
                      Email Address<span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="common-input px-16 w-100"
                      id="email"
                      placeholder="Email address"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-6 col-xs-6">
                    <label
                      htmlFor="phone"
                      className="flex-align gap-4 text-sm fw-semibold mb-4"
                    >
                      Phone Number<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="common-input px-16 w-100"
                      id="phone"
                      placeholder="Phone Number"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-6 col-xs-6">
                    <label
                      htmlFor="subject"
                      className="flex-align gap-4 text-sm fw-semibold mb-4"
                    >
                      Subject<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="common-input px-16 w-100"
                      id="subject"
                      placeholder="Subject"
                      value={form.subject}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-12">
                    <label
                      htmlFor="message"
                      className="flex-align gap-4 text-sm fw-semibold mb-4"
                    >
                      Message<span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="common-input px-16 w-100"
                      id="message"
                      placeholder="Type your message"
                      value={form.message}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-12 mt-32">
                    <button
                      type="submit"
                      className="btn btn-main py-18 px-32 rounded-8"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Get a Quote"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right - Contact Info */}
          <div className="col-lg-4">
            <div className="contact-box border border-gray-100 rounded-16 px-24 py-40">
              <h6 className="mb-48">Get In Touch</h6>
              <div className="flex-align gap-16 mb-16">
                <span className="w-40 h-40 flex-center rounded-circle border border-gray-100 text-main-two-600 text-2xl flex-shrink-0">
                  <i className="ph-fill ph-phone-call" />
                </span>
                <Link
                  to="tel:+917845298544"
                  className="text-md text-gray-900 hover-text-main-600"
                >
                  +91 7845298544
                </Link>
              </div>

              <div className="flex-align gap-16 mb-16">
                <span className="w-40 h-40 flex-center rounded-circle border border-gray-100 text-main-two-600 text-2xl flex-shrink-0">
                  <i className="ph-fill ph-envelope" />
                </span>
                <Link
                  to="mailto:info@rdegi.com"
                  className="text-md text-gray-900 hover-text-main-600"
                >
                  info@rdegi.com
                </Link>
              </div>

              <div className="flex-align gap-16 mb-0">
                <span className="w-40 h-40 flex-center rounded-circle border border-gray-100 text-main-two-600 text-2xl flex-shrink-0">
                  <i className="ph-fill ph-map-pin" />
                </span>
                <span className="text-md text-gray-900">
                  Instaspace, Near Kotak Mahindra Bank, Hosur - 6335126.
                </span>
              </div>
            </div>

            <div className="mt-24 flex-align flex-wrap gap-16">
              <Link
                to="#"
                className="bg-neutral-600 hover-bg-main-600 rounded-8 p-10 px-16 flex-between flex-wrap gap-8 flex-grow-1"
              >
                <span className="text-white fw-medium">Get Support On Call</span>
                <span className="w-36 h-36 bg-main-600 rounded-8 flex-center text-xl text-white">
                  <i className="ph ph-headset" />
                </span>
              </Link>
              <Link
                to="#"
                className="bg-neutral-600 hover-bg-main-600 rounded-8 p-10 px-16 flex-between flex-wrap gap-8 flex-grow-1"
              >
                <span className="text-white fw-medium">Get Direction</span>
                <span className="w-36 h-36 bg-main-600 rounded-8 flex-center text-xl text-white">
                  <i className="ph ph-map-pin" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
