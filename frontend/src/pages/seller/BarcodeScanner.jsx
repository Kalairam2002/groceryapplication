import React, { useState, useEffect } from "react";
import SellerLayout from "./SellerLayout";
import axios from "axios";

const BarcodeScanner = () => {
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.quantity * (item.offerPrice || item.price),
    0
  );

  // Auto-fetch product when barcode changes
  useEffect(() => {
    if (!barcode.trim()) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/product/scan-barcode/${barcode}`
        );

        if (data.success) {
          const product = data.product;
          const exists = cart.find((item) => item._id === product._id);

          if (exists) {
            setCart(
              cart.map((item) =>
                item._id === product._id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            );
          } else {
            setCart([...cart, { ...product, quantity: 1 }]);
          }
          setBarcode(""); // reset input for next scan
        }
      } catch (err) {
        console.error("Error fetching product:", err.message);
      } finally {
        setLoading(false);
      }
    };

    // Trigger fetch after small delay (helps with typing vs. scanning)
    const timer = setTimeout(() => {
      fetchProduct();
    }, 500); // 0.5s debounce

    return () => clearTimeout(timer);
  }, [barcode, cart]);

  const handleQuantityChange = (id, delta) => {
    setCart(
      cart.map((item) =>
        item._id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handleRemove = (id) => setCart(cart.filter((item) => item._id !== id));

  return (
    <SellerLayout page="barcode-professional">
      <div
        className="container py-5 px-4"
        style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
      >
        <h2 className="mb-4">Scan / Enter Barcode</h2>

        {/* Input Section */}
        <div className="mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="Scan or type barcode..."
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
          {loading && <small className="text-muted">Fetching product...</small>}
        </div>

        {/* Cart Table */}
        {cart.length > 0 && (
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Offer Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    <td>
                      <img
                        src={item.image?.[0]}
                        alt={item.name}
                        width="50"
                        height="50"
                        className="rounded"
                      />
                    </td>
                    <td>{item.name}</td>
                    <td>{item.brand}</td>
                    <td>₹{(item.offerPrice || item.price).toFixed(2)}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <button
                          className="btn btn-sm btn-secondary me-2"
                          onClick={() => handleQuantityChange(item._id, -1)}
                        >
                          -
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button
                          className="btn btn-sm btn-secondary ms-2"
                          onClick={() => handleQuantityChange(item._id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      ₹{((item.offerPrice || item.price) * item.quantity).toFixed(2)}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRemove(item._id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        {cart.length > 0 && (
          <div className="d-flex justify-content-end mt-4">
            <div className="me-4">
              <strong>Total Items:</strong> {totalQuantity}
            </div>
            <div>
              <strong>Total Price:</strong> ₹{totalPrice.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  );
};

export default BarcodeScanner;
