import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SellerEditProfile.css";

const SellerEditProfile = ({ seller }) => {
  const [formData, setFormData] = useState({
    name: seller?.name || "",
    phonenumber: seller?.phonenumber || "",
    gstnumber: seller?.gstnumber || "",
    email: seller?.email || ""
  });

  const navigate = useNavigate(); // hook for navigation

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put("http://localhost:5000/api/seller/profile", formData, {
        withCredentials: true
      });
      alert("Profile updated successfully!");
      navigate("/sellerDashboard"); // redirect to seller dashboard
    } catch (err) {
      alert("Error updating profile");
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <h2 className="edit-profile-title">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <label>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} />

          <label>Phone Number</label>
          <input name="phonenumber" value={formData.phonenumber} onChange={handleChange} />

          <label>GST Number</label>
          <input name="gstnumber" value={formData.gstnumber} onChange={handleChange} />

          <label>Address</label>
            <input name="address" value={formData.address} onChange={handleChange} />

          {/* <label>Email (read-only)</label>
          <input name="email" value={formData.email} disabled /> */}

          <button type="submit" className="save-btn">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default SellerEditProfile;
