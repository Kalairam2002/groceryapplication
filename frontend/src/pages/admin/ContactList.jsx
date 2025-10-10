import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import "./AdminDashboard.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/contact/?t=${Date.now()}` // bypass cache
        );
        const data = await res.json();

        if (data.success) {
          setContacts(data.data || []);
          toast.success("Contacts loaded successfully!", {
            position: "top-right",
            autoClose: 2000,
          });
        } else {
          toast.error("Failed to load contacts", {
            position: "top-right",
            autoClose: 2000,
          });
        }
      } catch (err) {
        console.error("Failed to fetch contacts", err);
        toast.error("Error fetching contact list!", {
          position: "top-right",
          autoClose: 2000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(contacts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContacts = Array.isArray(contacts)
    ? contacts.slice(indexOfFirstItem, indexOfLastItem)
    : [];

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <AdminLayout page="Admin-Contacts">
      <section className="orders py-5">
        <div className="container">
          <h3 className="mb-4">Contact Messages</h3>

          {loading ? (
            <p>Loading contacts...</p>
          ) : currentContacts.length === 0 ? (
            <p>No contact messages found.</p>
          ) : (
            <>
              <table className="classic-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentContacts.map((contact, idx) => (
                    <tr key={contact._id}>
                      <td>{indexOfFirstItem + idx + 1}</td>
                      <td>{contact.name}</td>
                      <td>{contact.email}</td>
                      <td>{contact.phone || "N/A"}</td>
                      <td>{contact.subject || "N/A"}</td>
                      <td>{contact.message}</td>
                      <td>{new Date(contact.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={currentPage === i + 1 ? "active" : ""}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <ToastContainer />
      </section>
    </AdminLayout>
  );
};

export default ContactList;
