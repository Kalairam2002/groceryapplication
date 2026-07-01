import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserEditProfile = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [formData, setFormData] = useState({
    username: storedUser?.username || "",
    firstName: storedUser?.firstName || "",
    lastName: storedUser?.lastName || "",
    phoneNumber: storedUser?.phoneNumber || "",
    email: storedUser?.email || "" // read-only
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
  
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/user/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,  
          },
          withCredentials: true,
        }
      );
  
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Profile updated successfully!");
      navigate("/account");
    } catch (err) {
      alert(err.response?.data?.message || "Error updating profile");
    }
  };
  

  return (
    <section className="py-80">
      <div className="container container-lg">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="border rounded-16 p-32 shadow-sm bg-white">
              <h3 className="mb-32 text-center">Edit Profile</h3>
              <form onSubmit={handleSubmit} className="row gy-4">
                
                <div className="col-md-6">
                  <label className="fw-medium mb-8">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="common-input"
                  />
                </div>

                <div className="col-md-6">
                  <label className="fw-medium mb-8">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="common-input"
                  />
                </div>

                <div className="col-md-6">
                  <label className="fw-medium mb-8">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="common-input"
                  />
                </div>

                <div className="col-md-6">
                  <label className="fw-medium mb-8">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="common-input"
                  />
                </div>

                {/* <div className="col-md-12">
                  <label className="fw-medium mb-8">Email (read-only)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="common-input bg-light"
                  />
                </div> */} 

                <div className="col-12 text-center mt-4">
                  <button type="submit" className="btn btn-main px-40 py-16" style={{marginTop: "30px"}}>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserEditProfile;
