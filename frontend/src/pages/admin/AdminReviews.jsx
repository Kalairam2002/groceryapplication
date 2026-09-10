import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | 5 | 4 | 3 | 2 | 1

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/review/all`,
        { withCredentials: true }
      );
      if (data.success) setReviews(data.reviews);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this review? This can't be undone.")) return;
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/review/${id}`,
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Review removed");
        setReviews((prev) => prev.filter((r) => r._id !== id));
      } else {
        toast.error(data.message || "Failed to remove review");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "—";

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const visibleReviews =
    filter === "all" ? reviews : reviews.filter((r) => r.rating === Number(filter));

  const Star = ({ filled }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#F2A623" : "none"} stroke={filled ? "#F2A623" : "#D6DDCA"} strokeWidth="1.6">
      <path d="M12 2.5l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8-6.2-3.7-6.2 3.7 1.6-6.8-5.2-4.6 6.9-.6z" strokeLinejoin="round" />
    </svg>
  );

  const StarRow = ({ rating }) => (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} filled={n <= rating} />
      ))}
    </div>
  );

  const initials = (name = "") =>
    name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <AdminLayout page="admin-reviews">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Catalogue / Reviews</span>
            <h4>Product reviews</h4>
            <p className="subtitle">Every rating across all sellers, with moderation controls.</p>
          </div>
        </div>

        {/* Summary row */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
          <div style={{
            background: "#fff", border: "1px solid #E3E8DD", borderRadius: "14px",
            padding: "1.25rem 1.5rem", minWidth: "180px", flex: "1 1 180px",
          }}>
            <p style={{ fontSize: "12px", color: "#6E7A6C", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>
              Overall rating
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "30px", fontWeight: 700, color: "#1C2620" }}>
                {avgRating}
              </span>
              {reviews.length > 0 && <StarRow rating={Math.round(avgRating)} />}
            </div>
          </div>

          <div style={{
            background: "#fff", border: "1px solid #E3E8DD", borderRadius: "14px",
            padding: "1.25rem 1.5rem", minWidth: "180px", flex: "1 1 180px",
          }}>
            <p style={{ fontSize: "12px", color: "#6E7A6C", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>
              Total reviews
            </p>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "30px", fontWeight: 700, color: "#1C2620" }}>
              {reviews.length}
            </span>
          </div>

          <div style={{
            background: "#fff", border: "1px solid #E3E8DD", borderRadius: "14px",
            padding: "1.1rem 1.5rem", flex: "2 1 320px", minWidth: "280px",
          }}>
            <p style={{ fontSize: "12px", color: "#6E7A6C", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>
              Rating breakdown
            </p>
            {distribution.map(({ star, count }) => (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "12px", color: "#1C2620", width: "10px" }}>{star}</span>
                <div style={{ flex: 1, background: "#F0F2EC", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                  <div style={{
                    width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%",
                    background: "#2F6D4F", height: "100%", borderRadius: "4px",
                  }} />
                </div>
                <span style={{ fontSize: "11px", color: "#9AA69A", width: "20px", textAlign: "right" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          {["all", "5", "4", "3", "2", "1"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: filter === f ? "1px solid #1C2620" : "1px solid #E3E8DD",
                background: filter === f ? "#1C2620" : "#fff",
                color: filter === f ? "#fff" : "#1C2620",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {f === "all" ? "All ratings" : `${f} ★`}
            </button>
          ))}
        </div>

        {/* Reviews list */}
        {loading ? (
          <p style={{ color: "#6E7A6C" }}>Loading reviews...</p>
        ) : visibleReviews.length === 0 ? (
          <div style={{
            background: "#fff", border: "1px dashed #D6DDCA", borderRadius: "14px",
            padding: "48px 24px", textAlign: "center", color: "#9AA69A",
          }}>
            No reviews match this filter.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "860px" }}>
            {visibleReviews.map((r) => (
              <div
                key={r._id}
                style={{
                  background: "#fff",
                  border: "1px solid #E3E8DD",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                }}
              >
                <div style={{
                  width: "38px", height: "38px", borderRadius: "50%",
                  background: "#EAF1E6", color: "#2F6D4F",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: 700, flexShrink: 0,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>
                  {initials(r.product?.seller?.name || "?")}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                    <StarRow rating={r.rating} />
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#1C2620" }}>
                      {r.product?.name || "Unknown product"}
                    </span>
                  </div>
                  {r.comment && (
                    <p style={{ margin: "0 0 6px", fontSize: "13.5px", color: "#4A554A", lineHeight: 1.5 }}>
                      {r.comment}
                    </p>
                  )}
                  <p style={{ margin: 0, fontSize: "11.5px", color: "#9AA69A", fontFamily: "'IBM Plex Mono', monospace" }}>
                    {r.product?.seller?.name || "Unknown seller"} · {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(r._id)}
                  style={{
                    flexShrink: 0,
                    padding: "7px 14px",
                    borderRadius: "8px",
                    border: "1px solid #F0999B",
                    background: "#FCEBEB",
                    color: "#791F1F",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </AdminLayout>
  );
};

export default AdminReviews;