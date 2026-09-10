import React, { useEffect, useState } from "react";
import axios from "axios";
import SellerLayout from "./SellerLayout";

const SellerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/review/seller`,
          { withCredentials: true }
        );
        if (data.success) {
          setReviews(data.reviews);
          setAvgRating(data.avgRating);
          setTotal(data.total);
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const visibleReviews =
    filter === "all" ? reviews : reviews.filter((r) => r.rating === Number(filter));

  const Star = ({ filled }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#D9A227" : "none"} stroke={filled ? "#D9A227" : "#DDE1F0"} strokeWidth="1.6">
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

  return (
    <SellerLayout>
      <div style={{ padding: "24px" }}>
        <p style={{ fontSize: "12px", color: "#3B4C8A", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 700 }}>
          Customer feedback
        </p>
        <h3 style={{ margin: "0 0 4px", fontFamily: "'Space Grotesk', sans-serif" }}>Reviews</h3>
        <p style={{ color: "#6B7280", marginBottom: "24px", fontSize: "14px" }}>
          What customers are saying about your products.
        </p>

        {/* Summary row */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
          <div style={{
            background: "#fff", border: "1px solid #E4E7F0", borderRadius: "14px",
            padding: "1.25rem 1.5rem", minWidth: "180px", flex: "1 1 180px",
          }}>
            <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>
              Average rating
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "30px", fontWeight: 700, color: "#1E2233" }}>
                {avgRating || "—"}
              </span>
              {total > 0 && <StarRow rating={Math.round(avgRating)} />}
            </div>
          </div>

          <div style={{
            background: "#fff", border: "1px solid #E4E7F0", borderRadius: "14px",
            padding: "1.25rem 1.5rem", minWidth: "180px", flex: "1 1 180px",
          }}>
            <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>
              Total reviews
            </p>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "30px", fontWeight: 700, color: "#1E2233" }}>
              {total}
            </span>
          </div>

          <div style={{
            background: "#fff", border: "1px solid #E4E7F0", borderRadius: "14px",
            padding: "1.1rem 1.5rem", flex: "2 1 320px", minWidth: "280px",
          }}>
            <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>
              Rating breakdown
            </p>
            {distribution.map(({ star, count }) => (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "12px", color: "#1E2233", width: "10px" }}>{star}</span>
                <div style={{ flex: 1, background: "#EEF0FA", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                  <div style={{
                    width: total ? `${(count / total) * 100}%` : "0%",
                    background: "#3B4C8A", height: "100%", borderRadius: "4px",
                  }} />
                </div>
                <span style={{ fontSize: "11px", color: "#9CA3AF", width: "20px", textAlign: "right" }}>{count}</span>
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
                border: filter === f ? "1px solid #1E2233" : "1px solid #E4E7F0",
                background: filter === f ? "#1E2233" : "#fff",
                color: filter === f ? "#fff" : "#1E2233",
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
          <p style={{ color: "#6B7280" }}>Loading reviews...</p>
        ) : visibleReviews.length === 0 ? (
          <div style={{
            background: "#fff", border: "1px dashed #DDE1F0", borderRadius: "14px",
            padding: "48px 24px", textAlign: "center", color: "#9CA3AF",
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
                  border: "1px solid #E4E7F0",
                  borderRadius: "14px",
                  padding: "16px 20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                  <StarRow rating={r.rating} />
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#1E2233" }}>
                    {r.product?.name || "Unknown product"}
                  </span>
                </div>
                {r.comment && (
                  <p style={{ margin: "0 0 6px", fontSize: "13.5px", color: "#454C63", lineHeight: 1.5 }}>
                    {r.comment}
                  </p>
                )}
                <p style={{ margin: 0, fontSize: "11.5px", color: "#9CA3AF", fontFamily: "'IBM Plex Mono', monospace" }}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </SellerLayout>
  );
};

export default SellerReviews;