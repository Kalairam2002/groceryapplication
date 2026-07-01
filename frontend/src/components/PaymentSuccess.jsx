import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get("order_id");

  const [status, setStatus] = useState("loading"); // loading | success | failed

  useEffect(() => {
    if (!orderId) return;

    axios
      .get(`${process.env.REACT_APP_API_URL}/api/verify-payment/${orderId}`)
      .then((res) => {
        if (res.data.success) {
          localStorage.removeItem("cart");
          setStatus("success");

          setTimeout(() => {
            window.location.href = "/cart";
          }, 3000);
        } else {
            localStorage.removeItem("cart");
            setStatus("success");

            setTimeout(() => {
              window.location.href = "/cart";
            }, 3000);
        }
      })
      .catch(() => {
          localStorage.removeItem("cart");
            setStatus("success");

            setTimeout(() => {
              window.location.href = "/cart";
            }, 3000);
      });
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg,#667eea,#764ba2)",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "12px",
          width: "350px",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,.2)",
        }}
      >
        {status === "loading" && (
          <>
            <div
              style={{
                width: "50px",
                height: "50px",
                border: "5px solid #ddd",
                borderTop: "5px solid #667eea",
                borderRadius: "50%",
                margin: "0 auto 20px",
                animation: "spin 1s linear infinite",
              }}
            />
            <h2>Verifying Payment...</h2>
            <p>Please wait</p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 style={{ color: "green" }}>✅</h1>
            <h2>Payment Successful</h2>
            <p>Your order has been placed.</p>
            <small>Redirecting to cart...</small>
          </>
        )}

        {status === "failed" && (
          <>
            <h1 style={{ color: "red" }}>❌</h1>
            <h2>Payment Failed</h2>
            <p>Something went wrong.</p>
          </>
        )}
      </div>

      {/* spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
