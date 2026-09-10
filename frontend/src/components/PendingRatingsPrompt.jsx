import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;
const SNOOZE_MAP_KEY = "ratingsPromptSnoozes"; // { "orderId_productId": timestamp }
const SNOOZE_DAYS = 2;

const getSnoozeMap = () => {
  try {
    return JSON.parse(localStorage.getItem(SNOOZE_MAP_KEY)) || {};
  } catch {
    return {};
  }
};

const isItemSnoozed = (key) => {
  const map = getSnoozeMap();
  return map[key] && Date.now() < map[key];
};

const snoozeItem = (key) => {
  const map = getSnoozeMap();
  map[key] = Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(SNOOZE_MAP_KEY, JSON.stringify(map));
};

const timeAgo = (dateStr) => {
  const days = Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Delivered today";
  if (days === 1) return "Delivered yesterday";
  return `Delivered ${days} days ago`;
};

const PendingRatingsPrompt = () => {
  const location = useLocation();
  const [pending, setPending] = useState([]);
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [submitting, setSubmitting] = useState({});

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  // Only show on customer-facing pages — never in admin, seller, or
  // delivery-boy areas even if a leftover customer session exists.
  const isCustomerRoute =
    !location.pathname.startsWith("/admin") &&
    !location.pathname.startsWith("/seller") &&
    !location.pathname.startsWith("/delivery");

  const keyFor = (item) => `${item.orderId}_${item.productId}`;

  useEffect(() => {
    if (!token || !user || !isCustomerRoute) {
      setPending([]);
      return;
    }

    const fetchPending = async () => {
      try {
        const { data } = await axios.get(`${API}/api/review/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          const notSnoozed = data.pending.filter((item) => !isItemSnoozed(keyFor(item)));
          setPending(notSnoozed);
        }
      } catch (err) {
        console.error("Failed to fetch pending ratings:", err);
      }
    };
    fetchPending();

    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, [token, user, isCustomerRoute]);

  const handleSubmit = async (item) => {
    const key = keyFor(item);
    const rating = ratings[key];
    if (!rating) return;

    setSubmitting((prev) => ({ ...prev, [key]: true }));
    try {
      const { data } = await axios.post(
        `${API}/api/review/add`,
        {
          orderId: item.orderId,
          productId: item.productId,
          rating,
          comment: comments[key] || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setPending((prev) => prev.filter((p) => keyFor(p) !== key));
      }
    } catch (err) {
      console.error("Failed to submit rating:", err);
    } finally {
      setSubmitting((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleMaybeLater = (item) => {
    snoozeItem(keyFor(item));
    setPending((prev) => prev.filter((p) => keyFor(p) !== keyFor(item)));
  };

  if (!isCustomerRoute || pending.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center",
        justifyContent: "center", zIndex: 99999, padding: "16px",
      }}
    >
      <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", width: "380px", maxHeight: "80vh", overflowY: "auto" }}>
        <h5 style={{ margin: "0 0 4px" }}>How was your order?</h5>
        <p style={{ fontSize: "13px", color: "#888", margin: "0 0 20px" }}>
          Rate the items you recently received.
        </p>

        {pending.map((item) => {
          const key = keyFor(item);
          const rating = ratings[key] || 0;
          return (
            <div key={key} style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #f0f0f0" }}>
              <p style={{ fontSize: "11px", color: "#F2A623", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 4px" }}>
                {timeAgo(item.deliveredAt)}
              </p>
              <p style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 10px" }}>{item.productName}</p>

              <div style={{ display: "flex", gap: "4px", marginBottom: "10px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setRatings((prev) => ({ ...prev, [key]: star }))}
                    style={{ fontSize: "24px", cursor: "pointer", color: star <= rating ? "#F2A623" : "#ddd" }}
                  >
                    ★
                  </span>
                ))}
              </div>

              <textarea
                placeholder="Tell us more (optional)"
                rows={2}
                value={comments[key] || ""}
                onChange={(e) => setComments((prev) => ({ ...prev, [key]: e.target.value }))}
                style={{ width: "100%", borderRadius: "8px", border: "1px solid #ddd", padding: "8px", marginBottom: "10px", boxSizing: "border-box", fontSize: "13px" }}
              />

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleSubmit(item)}
                  disabled={!rating || submitting[key]}
                  style={{
                    padding: "7px 16px", borderRadius: "8px", border: "none",
                    background: "#1B5E20", color: "#fff", fontWeight: 600, fontSize: "13px",
                    cursor: !rating || submitting[key] ? "not-allowed" : "pointer",
                    opacity: !rating || submitting[key] ? 0.6 : 1,
                  }}
                >
                  {submitting[key] ? "Submitting..." : "Submit"}
                </button>
                <button
                  onClick={() => handleMaybeLater(item)}
                  style={{
                    padding: "7px 16px", borderRadius: "8px", border: "1px solid #ddd",
                    background: "#fff", color: "#555", fontSize: "13px", cursor: "pointer",
                  }}
                >
                  Maybe later
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PendingRatingsPrompt;