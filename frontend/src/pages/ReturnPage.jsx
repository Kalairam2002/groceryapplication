import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const REASONS = [
  "Damaged product",
  "Wrong item received",
  "Quality not as expected",
  "Changed my mind",
];

const ReturnPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [allProducts, setAllProducts] = useState([]);

  // ✅ Bank details state
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/order/${orderId}`,
          { withCredentials: true }
        );
        if (data.success) setOrder(data.order);
        else setError("Order not found.");
      } catch (err) {
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/product/list`
      );
      if (data.success) {
        setAllProducts(data.products);
      }
    } catch (err) {
      console.log("Product fetch error");
    }
  };

  fetchProducts();
}, []);


useEffect(() => {
  if (!selectedProduct) return;

  const foundProduct = allProducts.find(
    (p) => p._id === selectedProduct
  );

  if (foundProduct && foundProduct.returnable === true) {
    alert("❌ This product is not eligible for return");

    // reset selection
    setSelectedProduct("");
  }
}, [selectedProduct, allProducts]);

  // ✅ Bank details change handler
  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedProduct) return setError("Please select a product to return.");
    if (!reason) return setError("Please select a reason.");

    // ✅ Bank details validation
    if (!bankDetails.accountHolderName.trim()) return setError("Please enter account holder name.");
    if (!bankDetails.accountNumber.trim()) return setError("Please enter account number.");
    if (!bankDetails.ifscCode.trim()) return setError("Please enter IFSC code.");
    if (!bankDetails.bankName.trim()) return setError("Please enter bank name.");

    setError("");
    setSubmitting(true);

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/returns/submit`,
        {
          orderId,
          productId: selectedProduct,
          reason,
          description,
          bankDetails, // ✅ send bank details
        },
        { withCredentials: true }
      );

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || "Failed to submit return.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={styles.center}><h3>Loading order details...</h3></div>
  );

  if (submitted) return (
    <div style={styles.center}>
      <div style={styles.successBox}>
        <h2>✅ Return Request Submitted!</h2>
        <p>Your return request has been sent to the seller. They will review and respond shortly.</p>
        <button onClick={() => navigate("/")} style={styles.btn}>Go to Home</button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔄 Return Product</h2>
        <p style={styles.subtitle}>
          Order ID: <b>{order?.razorpayOrderId || orderId}</b>
        </p>
        <p style={{ color: "#e74c3c", fontSize: "13px", marginBottom: "20px" }}>
          ⚠️ Returns are only accepted within <b>24 hours</b> of purchase.
        </p>

        {/* Product Selection */}
        <div style={styles.field}>
          <label style={styles.label}>Select Product to Return</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            style={styles.select}
          >
            <option value="">-- Select a product --</option>
            {order?.products?.map((item) => (
              <option key={item.id?._id} value={item.id?._id}>
                {item.name} (Qty: {item.quantity} | ₹{item.price})
              </option>
            ))}
          </select>
        </div>

        {/* Reason Selection */}
        <div style={styles.field}>
          <label style={styles.label}>Reason for Return</label>
          <div style={styles.reasonGrid}>
            {REASONS.map((r) => (
              <div
                key={r}
                onClick={() => setReason(r)}
                style={{
                  ...styles.reasonCard,
                  border: reason === r ? "2px solid #e74c3c" : "2px solid #ddd",
                  background: reason === r ? "#fff5f5" : "#fff",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: reason === r ? "600" : "400" }}>{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div style={styles.field}>
          <label style={styles.label}>Additional Details (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail..."
            rows={4}
            style={styles.textarea}
          />
        </div>

        {/* ✅ Bank Details Section */}
        <div style={styles.field}>
          <label style={styles.label}>Bank Details (for Refund)</label>

          <input
            type="text"
            name="accountHolderName"
            placeholder="Account Holder Name"
            value={bankDetails.accountHolderName}
            onChange={handleBankChange}
            style={{ ...styles.input, marginBottom: "10px" }}
          />
          <input
            type="text"
            name="accountNumber"
            placeholder="Account Number"
            value={bankDetails.accountNumber}
            onChange={handleBankChange}
            style={{ ...styles.input, marginBottom: "10px" }}
          />
          <input
            type="text"
            name="ifscCode"
            placeholder="IFSC Code"
            value={bankDetails.ifscCode}
            onChange={handleBankChange}
            style={{ ...styles.input, marginBottom: "10px" }}
          />
          <input
            type="text"
            name="bankName"
            placeholder="Bank Name"
            value={bankDetails.bankName}
            onChange={handleBankChange}
            style={styles.input}
          />
        </div>

        {/* Error */}
        {error && <p style={styles.error}>{error}</p>}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={styles.submitBtn}
        >
          {submitting ? "Submitting..." : "Submit Return Request"}
        </button>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8f9fa",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px 16px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
    padding: "40px",
    width: "100%",
    maxWidth: "600px",
  },
  title: { fontSize: "24px", fontWeight: "700", marginBottom: "6px", color: "#333" },
  subtitle: { fontSize: "14px", color: "#666", marginBottom: "6px" },
  field: { marginBottom: "24px" },
  label: { display: "block", fontWeight: "600", marginBottom: "8px", fontSize: "14px", color: "#444" },
  select: {
    width: "100%", padding: "10px 14px", borderRadius: "8px",
    border: "1px solid #ddd", fontSize: "14px", cursor: "pointer",
  },
  // ✅ input style — same look as select & textarea
  input: {
    width: "100%", padding: "10px 14px", borderRadius: "8px",
    border: "1px solid #ddd", fontSize: "14px",
    boxSizing: "border-box", fontFamily: "inherit", display: "block",
  },
  reasonGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px",
  },
  reasonCard: {
    padding: "12px 14px", borderRadius: "8px", cursor: "pointer",
    transition: "all 0.2s ease",
  },
  textarea: {
    width: "100%", padding: "10px 14px", borderRadius: "8px",
    border: "1px solid #ddd", fontSize: "14px", resize: "vertical",
    fontFamily: "inherit", boxSizing: "border-box",
  },
  error: { color: "#e74c3c", fontSize: "13px", marginBottom: "12px" },
  submitBtn: {
    width: "100%", padding: "14px", background: "#e74c3c",
    color: "#fff", border: "none", borderRadius: "10px",
    fontSize: "16px", fontWeight: "600", cursor: "pointer",
  },
  center: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" },
  successBox: {
    background: "#fff", borderRadius: "16px", padding: "40px",
    textAlign: "center", boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
  },
  btn: {
    marginTop: "16px", padding: "12px 24px", background: "#28a745",
    color: "#fff", border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
  },
};

export default ReturnPage;