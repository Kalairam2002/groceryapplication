import React, { useEffect, useState } from "react";
import axios from "axios";
import SellerLayout from "./SellerLayout";

const BASE_URL = process.env.REACT_APP_API_URL; // e.g. http://localhost:5000

const SellerInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // for detail modal

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/invoices/seller`, {
        withCredentials: true, // sends seller session/cookie
      });
      if (data.success) setInvoices(data.invoices);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (invoiceId) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/invoices/seller/${invoiceId}`, {
        withCredentials: true,
      });
      if (data.success) setSelected(data.invoice);
    } catch (err) {
      console.error("Failed to fetch invoice detail:", err);
    }
  };

  const closeModal = () => setSelected(null);

  if (loading) return (
    <SellerLayout page="invoices">
      <p className="p-6 text-gray-500">Loading invoices...</p>
    </SellerLayout>
  );

  return (
    <SellerLayout page="invoices">
    <div className="p-6">
      <span className="block font-mono text-xs font-semibold tracking-widest uppercase text-indigo-700 mb-1">
        Records / Invoices
      </span>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">My Invoices</h2>

      {invoices.length === 0 ? (
        <p className="text-gray-500">No invoices yet. They'll appear here after a customer purchases your product.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Invoice #</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-200">
              {invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-xs text-indigo-700">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{inv.items.length} item(s)</td>
                  <td className="px-4 py-3 font-semibold">₹{inv.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      inv.paymentType === "ONLINE"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {inv.paymentType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openDetail(inv._id)}
                      className="text-indigo-600 hover:underline text-xs font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>

            <h3 className="text-lg font-bold text-gray-800 mb-1">Invoice Detail</h3>
            <p className="text-xs text-gray-400 font-mono mb-4">{selected.invoiceNumber}</p>

            <div className="text-sm text-gray-600 mb-4 space-y-1">
              <p><span className="font-medium">Date:</span> {new Date(selected.createdAt).toLocaleString()}</p>
              <p><span className="font-medium">Payment:</span> {selected.paymentType}</p>
              {selected.razorpayPaymentId && (
                <p><span className="font-medium">Razorpay ID:</span> {selected.razorpayPaymentId}</p>
              )}
              <p><span className="font-medium">Status:</span> {selected.status}</p>
            </div>

            <table className="w-full text-sm mb-4 border-t border-b border-gray-200">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="py-2 text-left px-2">Product</th>
                  <th className="py-2 text-right px-2">Qty</th>
                  <th className="py-2 text-right px-2">Price</th>
                  <th className="py-2 text-right px-2">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selected.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-2">{item.name || item.product?.name || "—"}</td>
                    <td className="py-2 px-2 text-right">{item.quantity}</td>
                    <td className="py-2 px-2 text-right">₹{item.price.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right font-medium">₹{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center font-bold text-gray-800 text-base">
              <span>Total</span>
              <span>₹{selected.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
    </SellerLayout>
  );
};

export default SellerInvoices;