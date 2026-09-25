import React, { useEffect, useState } from "react";
import axios from "axios";
import SellerLayout from "./SellerLayout";

const BASE_URL = process.env.REACT_APP_API_URL;

const SellerReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Refund modal state
  const [refundModalReturn, setRefundModalReturn] = useState(null); // the return object being refunded, or null
  const [transactionRef, setTransactionRef] = useState("");
  const [refundError, setRefundError] = useState("");
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/returns/seller`, {
        withCredentials: true,
      });
      if (data.success) setReturns(data.returns);
    } catch (err) {
      console.error("Failed to fetch returns:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (returnId, status) => {
    try {
      const { data } = await axios.put(
        `${BASE_URL}/api/returns/seller/${returnId}`,
        { status },
        { withCredentials: true }
      );
      if (data.success) {
        setReturns((prev) =>
          prev.map((r) => (r._id === returnId ? { ...r, status } : r))
        );
      }
    } catch (err) {
      console.error("Failed to update return:", err);
    }
  };

  // ✅ Open the refund modal for a specific return
  const openRefundModal = (returnDoc) => {
    setRefundModalReturn(returnDoc);
    setTransactionRef("");
    setRefundError("");
  };

  const closeRefundModal = () => {
    if (refundSubmitting) return; // don't allow closing mid-submit
    setRefundModalReturn(null);
    setTransactionRef("");
    setRefundError("");
  };

  // ✅ Submit the refund — validates input, calls the new endpoint, updates the row in place
  const handleSubmitRefund = async () => {
    if (!transactionRef.trim()) {
      setRefundError("Enter a transaction reference first");
      return;
    }

    setRefundSubmitting(true);
    setRefundError("");

    try {
      const { data } = await axios.put(
        `${BASE_URL}/api/returns/seller/${refundModalReturn._id}/refund`,
        { refundTransactionRef: transactionRef.trim() },
        { withCredentials: true }
      );

      if (data.success) {
        setReturns((prev) =>
          prev.map((r) => (r._id === refundModalReturn._id ? data.return : r))
        );
        setRefundModalReturn(null);
        setTransactionRef("");
      } else {
        setRefundError(data.message || "Failed to mark as refunded");
      }
    } catch (err) {
      setRefundError(
        err.response?.data?.message || "Failed to mark as refunded"
      );
    } finally {
      setRefundSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Approved") return {
      background: "#f0fdf4", color: "#166534",
      border: "1px solid #bbf7d0",
    };
    if (status === "Rejected") return {
      background: "#fef2f2", color: "#991b1b",
      border: "1px solid #fecaca",
    };
    return {
      background: "#fffbeb", color: "#92400e",
      border: "1px solid #fde68a",
    };
  };

  return (
    <SellerLayout page="Returns">
      <div style={{ padding: "32px" }}>
        <span style={{ display: "block", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#3B4C8A", marginBottom: "6px" }}>
          Records / Returns
        </span>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "22px", fontWeight: "600", marginBottom: "24px", color: "#1E2233" }}>
          Return requests
        </h2>

        {loading ? (
          <p style={{ color: "#888" }}>Loading returns...</p>
        ) : returns.length === 0 ? (
          <div style={{
            background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb",
            padding: "48px", textAlign: "center",
          }}>
            <p style={{ color: "#888", fontSize: "15px" }}>No return requests yet.</p>
          </div>
        ) : (
          <div style={{
            background: "#fff", borderRadius: "12px",
            border: "1px solid #e5e7eb", overflow: "hidden",
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#F6F7FB" }}>
                  {["Product", "Customer", "Reason", "Description", "Bank Details", "Date", "Status", "Action"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left",
                      color: "#6B7280", fontWeight: "600", fontSize: "11.5px",
                      fontFamily: "'Space Grotesk', sans-serif",
                      borderBottom: "1px solid #E4E7F0", textTransform: "uppercase",
                      letterSpacing: "0.04em", whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {returns.map((r, i) => (
                  <tr key={r._id} style={{
                    borderTop: i === 0 ? "none" : "1px solid #f3f4f6",
                    background: i % 2 === 0 ? "#fff" : "#fafafa",
                  }}>
                    <td style={{ padding: "14px 16px", fontWeight: "500", color: "#111" }}>
                      {r.productName || r.product?.name}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#555" }}>
                      {r.userFirstName || r.userId}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#111" }}>{r.reason}</td>
                    <td style={{ padding: "14px 16px", color: "#888" }}>
                      {r.description || "—"}
                    </td>

                    {/* ✅ Bank Details Column */}
                    <td style={{ padding: "14px 16px" }}>
                      {r.bankDetails ? (
                        <div style={{
                          background: "#EEF1FA",
                          border: "1px solid #C7D0EA",
                          borderRadius: "8px",
                          padding: "10px 12px",
                          minWidth: "200px",
                          fontSize: "12px",
                          lineHeight: "1.8",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                            <span style={{ fontSize: "13px" }}>🏦</span>
                            <span style={{ fontWeight: "600", color: "#3B4C8A", fontSize: "12px" }}>
                              {r.bankDetails.bankName}
                            </span>
                          </div>
                          <div style={{ color: "#374151" }}>
                            <span style={{ color: "#6b7280" }}>Name: </span>
                            <b>{r.bankDetails.accountHolderName}</b>
                          </div>
                          <div style={{ color: "#374151" }}>
                            <span style={{ color: "#6b7280" }}>A/C: </span>
                            <b style={{ letterSpacing: "0.5px" }}>
                              {r.bankDetails.accountNumber}
                            </b>
                          </div>
                          <div style={{ color: "#374151" }}>
                            <span style={{ color: "#6b7280" }}>IFSC: </span>
                            <b style={{ letterSpacing: "1px", color: "#3B4C8A" }}>
                              {r.bankDetails.ifscCode}
                            </b>
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: "#aaa", fontSize: "13px" }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: "14px 16px", color: "#888" }}>
                      {new Date(r.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        ...getStatusStyle(r.status),
                        padding: "3px 10px", borderRadius: "6px",
                        fontSize: "11px", fontWeight: "600",
                        display: "inline-block",
                      }}>
                        {r.status}
                      </span>
                    </td>

                    {/* ✅ Action column — three states: Pending (approve/reject,
                        unchanged), Approved + not yet refunded (new "Mark as
                        refunded" button), Approved + refunded (badge, no buttons) */}
                    <td style={{ padding: "14px 16px" }}>
                      {r.status === "Pending" ? (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => handleAction(r._id, "Approved")}
                            style={{
                              background: "#f0fdf4", color: "#166534",
                              border: "1px solid #bbf7d0", borderRadius: "6px",
                              padding: "5px 12px", fontSize: "12px",
                              fontWeight: "500", cursor: "pointer",
                            }}
                          >
                            ✅
                          </button>
                          <button
                            onClick={() => handleAction(r._id, "Rejected")}
                            style={{
                              background: "#fef2f2", color: "#991b1b",
                              border: "1px solid #fecaca", borderRadius: "6px",
                              padding: "5px 12px", fontSize: "12px",
                              fontWeight: "500", cursor: "pointer",
                            }}
                          >
                            ❌
                          </button>
                        </div>
                      ) : r.status === "Approved" && r.refundStatus === "Completed" ? (
                        <span
                          title={r.refundedAt ? new Date(r.refundedAt).toLocaleString("en-IN") : ""}
                          style={{
                            background: "#f0fdf4", color: "#166534",
                            border: "1px solid #bbf7d0", borderRadius: "6px",
                            padding: "5px 12px", fontSize: "12px",
                            fontWeight: "500", display: "inline-block",
                          }}
                        >
                          Refunded · {r.refundTransactionRef}
                        </span>
                      ) : r.status === "Approved" ? (
                        <button
                          onClick={() => openRefundModal(r)}
                          style={{
                            background: "#EEF1FA", color: "#3B4C8A",
                            border: "1px solid #C7D0EA", borderRadius: "6px",
                            padding: "5px 12px", fontSize: "12px",
                            fontWeight: "500", cursor: "pointer",
                          }}
                        >
                          Mark as refunded
                        </button>
                      ) : (
                        <span style={{ color: "#aaa", fontSize: "13px" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ✅ Refund modal — collects the transaction reference for the return
          currently being refunded. Bank details are already on file, so
          this is the only input needed. */}
      {refundModalReturn && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={closeRefundModal}
        >
          <div
            style={{
              background: "#fff", borderRadius: "14px", padding: "28px",
              width: "420px", maxWidth: "90vw",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "17px", fontWeight: "600", marginBottom: "4px", color: "#1E2233" }}>
              Mark as refunded
            </h3>
            <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "18px" }}>
              {refundModalReturn.productName} · {refundModalReturn.userFirstName || refundModalReturn.userId}
            </p>

            <div style={{
              background: "#EEF1FA", border: "1px solid #C7D0EA", borderRadius: "8px",
              padding: "10px 12px", fontSize: "12px", lineHeight: "1.8", marginBottom: "18px",
            }}>
              <div style={{ color: "#374151" }}>
                <span style={{ color: "#6b7280" }}>Name: </span>
                <b>{refundModalReturn.bankDetails?.accountHolderName}</b>
              </div>
              <div style={{ color: "#374151" }}>
                <span style={{ color: "#6b7280" }}>A/C: </span>
                <b style={{ letterSpacing: "0.5px" }}>{refundModalReturn.bankDetails?.accountNumber}</b>
              </div>
              <div style={{ color: "#374151" }}>
                <span style={{ color: "#6b7280" }}>IFSC: </span>
                <b style={{ letterSpacing: "1px", color: "#3B4C8A" }}>{refundModalReturn.bankDetails?.ifscCode}</b>
              </div>
            </div>

            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
              Transaction reference (UTR)
            </label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => {
                setTransactionRef(e.target.value);
                if (refundError) setRefundError("");
              }}
              placeholder="e.g. UTR2409231234567"
              style={{
                width: "100%", padding: "9px 12px", borderRadius: "8px",
                border: refundError ? "1px solid #fca5a5" : "1px solid #d1d5db",
                fontSize: "13px", marginBottom: "6px", boxSizing: "border-box",
              }}
            />
            {refundError && (
              <p style={{ color: "#991b1b", fontSize: "12px", marginBottom: "10px" }}>{refundError}</p>
            )}

            <div style={{ display: "flex", gap: "8px", marginTop: "18px" }}>
              <button
                onClick={closeRefundModal}
                disabled={refundSubmitting}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: "8px",
                  border: "1px solid #d1d5db", background: "#fff",
                  fontSize: "13px", fontWeight: "500", cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRefund}
                disabled={refundSubmitting}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: "8px",
                  border: "1px solid #166534", background: refundSubmitting ? "#86efac" : "#16a34a",
                  color: "#fff", fontSize: "13px", fontWeight: "600",
                  cursor: refundSubmitting ? "default" : "pointer",
                }}
              >
                {refundSubmitting ? "Saving..." : "Confirm refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </SellerLayout>
  );
};

export default SellerReturns;