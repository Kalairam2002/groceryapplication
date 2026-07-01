import Invoice from "../models/Invoice.js";

export const getSellerInvoices = async (req, res) => {
  try {
    const sellerId = req.sellerId;
    const invoices = await Invoice.find({ sellerId }).sort({ createdAt: -1 });
    res.json({ success: true, invoices });
  } catch (error) {
    console.error("Get seller invoices error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSellerInvoiceDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });
    res.json({ success: true, invoice });
  } catch (error) {
    console.error("Get invoice detail error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};