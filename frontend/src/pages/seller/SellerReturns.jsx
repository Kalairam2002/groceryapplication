import React, { useEffect, useState } from "react";
import axios from "axios";
import SellerLayout from "./SellerLayout";

const BASE_URL = process.env.REACT_APP_API_URL;

// ---------- design tokens (same palette as the rest of the seller panel) ----------
const T = {
  ink: "#1E2233",
  muted: "#6B7280",
  border: "#E4E7F0",
  soft: "#F6F7FB",
  blue: "#3B4C8A",
  blueBg: "#EEF1FA",
  blueBorder: "#C7D0EA",
  green: "#166534",
  greenBg: "#f0fdf4",
  greenBorder: "#bbf7d0",
  amber: "#92400e",
  amberBg: "#fffbeb",
  amberBorder: "#fde68a",
  red: "#991b1b",
  redBg: "#fef2f2",
  redBorder: "#fecaca",
};

const FILTERS = ["All", "Pending", "Awaiting pickup", "Ready to refund", "Refunded", "Rejected"];

const SectionLabel = ({ children }) => (
  <div
    style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: "10.5px",
      fontWeight: "600",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: T.muted,
      marginBottom: "8px",
    }}
  >
    {children}
  </div>
);

const pill = (bg, color, border) => ({
  background: bg,
  color,
  border: `1px solid ${border}`,
  padding: "3px 10px",
  borderRadius: "999px",
  fontSize: "11.5px",
  fontWeight: "600",
  display: "inline-block",
  whiteSpace: "nowrap",
});

const SellerReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  // ✅ Refund modal state
  const [refundModalReturn, setRefundModalReturn] = useState(null); // the return object being refunded, or null
  const [transactionRef, setTransactionRef] = useState("");
  const [refundError, setRefundError] = useState("");
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  // ✅ Return pickup state — which delivery boy collects the product
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selectedBoy, setSelectedBoy] = useState({}); // { [returnId]: deliveryBoyId }
  const [assigningId, setAssigningId] = useState(null); // return currently being assigned
  const [assignErrors, setAssignErrors] = useState({}); // { [returnId]: message }
  const [changingId, setChangingId] = useState(null); // return whose delivery boy is being changed

  useEffect(() => {
    fetchReturns();
    fetchDeliveryBoys();
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

  const fetchDeliveryBoys = async () => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/api/returns/seller/delivery-boys`,
        { withCredentials: true }
      );
      if (data.success) setDeliveryBoys(data.deliveryBoys);
    } catch (err) {
      console.error("Failed to fetch delivery boys:", err);
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
        // Newly approved returns now need a pickup — reload so the row
        // comes back with its pickup status.
        if (status === "Approved") fetchReturns();
      }
    } catch (err) {
      console.error("Failed to update return:", err);
    }
  };

  // ✅ Assign (or change) the delivery boy who collects this return
  const handleAssign = async (returnId) => {
    const deliveryBoyId = selectedBoy[returnId];
    if (!deliveryBoyId) {
      setAssignErrors((prev) => ({ ...prev, [returnId]: "Select a delivery boy first" }));
      return;
    }

    setAssigningId(returnId);
    setAssignErrors((prev) => ({ ...prev, [returnId]: "" }));

    try {
      const { data } = await axios.put(
        `${BASE_URL}/api/returns/seller/${returnId}/assign-pickup`,
        { deliveryBoyId },
        { withCredentials: true }
      );

      if (data.success) {
        const u = data.return;
        // Only copy the pickup fields — keeps the customer name etc. on the row
        setReturns((prev) =>
          prev.map((r) =>
            r._id === returnId
              ? {
                  ...r,
                  pickupStatus: u.pickupStatus,
                  pickupDeliveryBoy: u.pickupDeliveryBoy,
                  pickupAssignedAt: u.pickupAssignedAt,
                  pickupPickedUpAt: u.pickupPickedUpAt,
                  pickupDeliveredAt: u.pickupDeliveredAt,
                }
              : r
          )
        );
        setChangingId(null);
        setSelectedBoy((prev) => {
          const next = { ...prev };
          delete next[returnId];
          return next;
        });
      } else {
        setAssignErrors((prev) => ({
          ...prev,
          [returnId]: data.message || "Failed to assign",
        }));
      }
    } catch (err) {
      setAssignErrors((prev) => ({
        ...prev,
        [returnId]: err.response?.data?.message || "Failed to assign",
      }));
    } finally {
      setAssigningId(null);
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
        // Merge instead of replacing, so the customer name and the
        // delivery boy's name (which the refund response doesn't carry) stay on the row
        setReturns((prev) =>
          prev.map((r) =>
            r._id === refundModalReturn._id
              ? {
                  ...r,
                  ...data.return,
                  userFirstName: r.userFirstName,
                  pickupDeliveryBoy: r.pickupDeliveryBoy,
                  product: r.product,
                  orderId: r.orderId,
                }
              : r
          )
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
    if (status === "Approved") return pill(T.greenBg, T.green, T.greenBorder);
    if (status === "Rejected") return pill(T.redBg, T.red, T.redBorder);
    return pill(T.amberBg, T.amber, T.amberBorder);
  };

  const getPickupStyle = (status) => {
    if (status === "Delivered to Seller") return pill(T.greenBg, T.green, T.greenBorder);
    if (status === "Picked Up") return pill(T.blueBg, T.blue, T.blueBorder);
    return pill(T.amberBg, T.amber, T.amberBorder);
  };

  // Returns made before pickup tracking existed have no pickupStatus at all.
  // They skip the pickup step and can be refunded straight away, as before.
  const isLegacyReturn = (r) => r.pickupStatus === undefined;

  // ✅ Refund is only allowed once the product is back with the seller
  const canRefund = (r) =>
    r.status === "Approved" &&
    r.refundStatus !== "Completed" &&
    (isLegacyReturn(r) || r.pickupStatus === "Delivered to Seller");

  // Which filter chip a return belongs to
  const getStage = (r) => {
    if (r.status === "Pending") return "Pending";
    if (r.status === "Rejected") return "Rejected";
    if (r.refundStatus === "Completed") return "Refunded";
    if (canRefund(r)) return "Ready to refund";
    return "Awaiting pickup";
  };

  const counts = {};
  FILTERS.forEach((f) => {
    counts[f] = f === "All" ? returns.length : returns.filter((r) => getStage(r) === f).length;
  });
  const visibleReturns =
    filter === "All" ? returns : returns.filter((r) => getStage(r) === filter);

  // ---------- small building blocks ----------
  const InfoRow = ({ label, value, mono }) => (
    <div style={{ display: "flex", gap: "8px", fontSize: "12.5px", lineHeight: "1.8" }}>
      <span style={{ color: T.muted, width: "44px", flexShrink: 0 }}>{label}</span>
      <b
        style={{
          color: "#111827",
          letterSpacing: mono ? "0.5px" : "normal",
          wordBreak: "break-all",
        }}
      >
        {value}
      </b>
    </div>
  );

  // ✅ The "Pickup" section of a card
  const renderPickup = (r) => {
    const muted = (text) => (
      <span style={{ color: "#9CA3AF", fontSize: "13px" }}>{text}</span>
    );

    if (r.status === "Pending") return muted("Available once approved");
    if (r.status === "Rejected") return muted("—");
    if (isLegacyReturn(r)) return muted("Not required for this return");

    const status = r.pickupStatus;
    const boy = r.pickupDeliveryBoy; // { name, phone } once assigned

    const boyLine = boy ? (
      <div style={{ fontSize: "13px", color: "#374151", marginTop: "8px", lineHeight: 1.6 }}>
        <b>{boy.name}</b>
        {boy.phone ? <div style={{ color: T.muted }}>📞 {boy.phone}</div> : null}
      </div>
    ) : null;

    // Pickup already happening or finished — show the status, no changes
    if (status === "Picked Up" || status === "Delivered to Seller") {
      return (
        <div>
          <span style={getPickupStyle(status)}>
            {status === "Picked Up" ? "🛵 Picked up" : "✅ Delivered to you"}
          </span>
          {boyLine}
        </div>
      );
    }

    // Refunded without a pickup (nothing to assign any more)
    if (r.refundStatus === "Completed") return muted("—");

    const showPicker = status === "Not Assigned" || changingId === r._id;

    // Assigned, not changing — show who, with a Change button
    if (status === "Assigned" && !showPicker) {
      return (
        <div>
          <span style={getPickupStyle(status)}>🛵 Assigned</span>
          {boyLine}
          <button
            onClick={() => {
              setChangingId(r._id);
              setSelectedBoy((prev) => ({
                ...prev,
                [r._id]: r.pickupDeliveryBoy?._id || "",
              }));
            }}
            style={{
              marginTop: "8px", background: "none", border: "none",
              color: T.blue, fontSize: "12.5px", fontWeight: "600",
              cursor: "pointer", padding: 0, textDecoration: "underline",
            }}
          >
            Change delivery boy
          </button>
        </div>
      );
    }

    // Not assigned yet (or changing) — dropdown + button
    return (
      <div>
        {deliveryBoys.length === 0 ? (
          <span style={{ fontSize: "12.5px", color: T.amber }}>
            No delivery boys available
          </span>
        ) : (
          <>
            <select
              value={selectedBoy[r._id] || ""}
              onChange={(e) => {
                setSelectedBoy((prev) => ({ ...prev, [r._id]: e.target.value }));
                if (assignErrors[r._id]) {
                  setAssignErrors((prev) => ({ ...prev, [r._id]: "" }));
                }
              }}
              style={{
                width: "100%", padding: "9px 10px", borderRadius: "8px",
                border: "1px solid #D7DAE5", fontSize: "13px",
                background: "#fff", boxSizing: "border-box", color: T.ink,
              }}
            >
              <option value="">-- Select delivery boy --</option>
              {deliveryBoys.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} - {d.phone}
                </option>
              ))}
            </select>

            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button
                onClick={() => handleAssign(r._id)}
                disabled={assigningId === r._id}
                style={{
                  background: T.blue, color: "#fff",
                  border: "none", borderRadius: "8px",
                  padding: "8px 16px", fontSize: "12.5px", fontWeight: "600",
                  cursor: assigningId === r._id ? "default" : "pointer",
                  opacity: assigningId === r._id ? 0.7 : 1,
                }}
              >
                {assigningId === r._id
                  ? "Assigning..."
                  : status === "Assigned"
                  ? "Save"
                  : "Assign"}
              </button>
              {status === "Assigned" && (
                <button
                  onClick={() => setChangingId(null)}
                  style={{
                    background: "#fff", color: "#555",
                    border: "1px solid #D7DAE5", borderRadius: "8px",
                    padding: "8px 14px", fontSize: "12.5px", cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </>
        )}

        {assignErrors[r._id] && (
          <p style={{ color: T.red, fontSize: "12px", margin: "8px 0 0" }}>
            {assignErrors[r._id]}
          </p>
        )}
      </div>
    );
  };

  // ✅ The footer of a card: a short hint on the left, the next action on the right
  const renderFooter = (r) => {
    if (r.status === "Rejected") return null;

    let note = "";
    let action = null;

    if (r.status === "Pending") {
      note = "Approve to arrange a pickup and the refund";
      action = (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => handleAction(r._id, "Rejected")}
            style={{
              background: "#fff", color: T.red,
              border: `1px solid ${T.redBorder}`, borderRadius: "8px",
              padding: "8px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
            }}
          >
            Reject
          </button>
          <button
            onClick={() => handleAction(r._id, "Approved")}
            style={{
              background: "#16a34a", color: "#fff", border: "none",
              borderRadius: "8px", padding: "8px 18px",
              fontSize: "13px", fontWeight: "600", cursor: "pointer",
            }}
          >
            Approve
          </button>
        </div>
      );
    } else if (r.refundStatus === "Completed") {
      note = r.refundedAt
        ? `Refunded on ${new Date(r.refundedAt).toLocaleDateString("en-IN")}`
        : "Refunded";
      action = (
        <span style={pill(T.greenBg, T.green, T.greenBorder)}>
          ✓ Refunded · {r.refundTransactionRef}
        </span>
      );
    } else if (canRefund(r)) {
      note = isLegacyReturn(r)
        ? "Ready for refund"
        : "The product is back with you — you can send the refund now";
      action = (
        <button
          onClick={() => openRefundModal(r)}
          style={{
            background: T.blue, color: "#fff", border: "none",
            borderRadius: "8px", padding: "9px 18px",
            fontSize: "13px", fontWeight: "600", cursor: "pointer",
          }}
        >
          Mark as refunded
        </button>
      );
    } else {
      const s = r.pickupStatus;
      note =
        s === "Not Assigned"
          ? "Assign a delivery boy to start the pickup"
          : s === "Assigned"
          ? "Waiting for the delivery boy to collect the product"
          : "On its way back to you — refund unlocks after delivery";
    }

    return (
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "12px", flexWrap: "wrap", padding: "12px 20px",
          borderTop: "1px solid #F0F1F6", background: "#FAFBFD",
        }}
      >
        <span style={{ fontSize: "12.5px", color: T.muted }}>{note}</span>
        {action}
      </div>
    );
  };

  return (
    <SellerLayout page="Returns">
      <div style={{ padding: "32px", maxWidth: "1100px" }}>
        <span style={{ display: "block", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: T.blue, marginBottom: "6px" }}>
          Records / Returns
        </span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "22px", fontWeight: "600", margin: 0, color: T.ink }}>
            Return requests
          </h2>
          <button
            onClick={() => {
              fetchReturns();
              fetchDeliveryBoys();
            }}
            style={{
              background: "#fff", color: T.ink,
              border: "1px solid #D7DAE5", borderRadius: "8px",
              padding: "8px 14px", fontSize: "12px", fontWeight: "600",
              cursor: "pointer",
            }}
          >
            ↻ Refresh
          </button>
        </div>

        {/* Filter chips */}
        {!loading && returns.length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
            {FILTERS.map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    background: active ? T.ink : "#fff",
                    color: active ? "#fff" : counts[f] === 0 ? "#9CA3AF" : T.ink,
                    border: `1px solid ${active ? T.ink : "#D7DAE5"}`,
                    borderRadius: "999px",
                    padding: "6px 14px",
                    fontSize: "12.5px",
                    fontWeight: "600",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {f}
                  <span
                    style={{
                      marginLeft: "8px",
                      background: active ? "rgba(255,255,255,0.2)" : T.soft,
                      color: active ? "#fff" : T.muted,
                      borderRadius: "999px",
                      padding: "1px 8px",
                      fontSize: "11.5px",
                    }}
                  >
                    {counts[f]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <p style={{ color: "#888" }}>Loading returns...</p>
        ) : returns.length === 0 ? (
          <div style={{
            background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb",
            padding: "48px", textAlign: "center",
          }}>
            <p style={{ color: "#888", fontSize: "15px" }}>No return requests yet.</p>
          </div>
        ) : visibleReturns.length === 0 ? (
          <div style={{
            background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb",
            padding: "40px", textAlign: "center",
          }}>
            <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
              No returns in "{filter}".
            </p>
          </div>
        ) : (
          visibleReturns.map((r) => (
            <div
              key={r._id}
              style={{
                background: "#fff", border: `1px solid ${T.border}`,
                borderRadius: "14px", marginBottom: "16px", overflow: "hidden",
              }}
            >
              {/* Header: product, customer, date, status */}
              <div
                style={{
                  display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                  gap: "12px", flexWrap: "wrap", padding: "16px 20px",
                  borderBottom: "1px solid #F0F1F6",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "16px", fontWeight: "600", color: T.ink }}>
                    {r.productName || r.product?.name}
                  </div>
                  <div style={{ fontSize: "12.5px", color: T.muted, marginTop: "3px" }}>
                    {r.userFirstName || r.userId} · Requested {new Date(r.createdAt).toLocaleDateString("en-IN")}
                  </div>
                </div>
                <span style={getStatusStyle(r.status)}>{r.status}</span>
              </div>

              {/* Body: reason | bank details | pickup */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "24px", padding: "20px",
                }}
              >
                <div>
                  <SectionLabel>Reason</SectionLabel>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                    {r.reason}
                  </div>
                  <div style={{ fontSize: "13px", color: T.muted, marginTop: "4px", lineHeight: 1.5 }}>
                    {r.description || "No description given"}
                  </div>
                </div>

                <div>
                  <SectionLabel>Refund to</SectionLabel>
                  {r.bankDetails ? (
                    <div
                      style={{
                        background: T.blueBg, border: `1px solid ${T.blueBorder}`,
                        borderRadius: "10px", padding: "10px 12px",
                      }}
                    >
                      <div style={{ fontWeight: "600", color: T.blue, fontSize: "13px", marginBottom: "2px" }}>
                        🏦 {r.bankDetails.bankName}
                      </div>
                      <InfoRow label="Name" value={r.bankDetails.accountHolderName} />
                      <InfoRow label="A/C" value={r.bankDetails.accountNumber} mono />
                      <InfoRow label="IFSC" value={r.bankDetails.ifscCode} mono />
                    </div>
                  ) : (
                    <span style={{ color: "#9CA3AF", fontSize: "13px" }}>—</span>
                  )}
                </div>

                <div>
                  <SectionLabel>Pickup</SectionLabel>
                  {renderPickup(r)}
                </div>
              </div>

              {renderFooter(r)}
            </div>
          ))
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
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "17px", fontWeight: "600", marginBottom: "4px", color: T.ink }}>
              Mark as refunded
            </h3>
            <p style={{ fontSize: "13px", color: T.muted, marginBottom: "18px" }}>
              {refundModalReturn.productName} · {refundModalReturn.userFirstName || refundModalReturn.userId}
            </p>

            <div style={{
              background: T.blueBg, border: `1px solid ${T.blueBorder}`, borderRadius: "8px",
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
                <b style={{ letterSpacing: "1px", color: T.blue }}>{refundModalReturn.bankDetails?.ifscCode}</b>
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
              <p style={{ color: T.red, fontSize: "12px", marginBottom: "10px" }}>{refundError}</p>
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