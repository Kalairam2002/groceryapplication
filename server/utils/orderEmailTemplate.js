const orderEmailTemplate = ({ userName, orderId, products, subtotal, tax, total, dbOrderId }) => {
  const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

  const rows = products
    .map(
      (item, index) => `
        ${index + 1}. ${item.name}<br/>
       Qty: ${item.quantity} × ${item.sizeLabel || (item.unit ? `${item.variantQuantity} ${item.unit}` : "unit")}<br/>
        Price: ₹${Number(item.price).toFixed(2)}<br/>
        Total: ₹${(Number(item.price) * item.quantity).toFixed(2)}<br/>
        <hr/>
      `
    )
    .join("");

    console.log("Generating email with order ID:", dbOrderId );
    console.log(orderId,"orderid data in email template");

  // Return link — only shown if dbOrderId is provided
  const returnSection = dbOrderId
    ? `
      <div style="margin-top: 20px; padding: 15px; background: #fff8e1; border-left: 4px solid #f0ad4e; border-radius: 6px;">
        <p style="margin: 0 0 8px 0;"><b>🔄 Need to return a product?</b></p>
        <p style="margin: 0 0 10px 0; color: #555; font-size: 14px;">
          You can request a return within <b>24 hours</b> of placing your order.
        </p>
        <a 
          href="${CLIENT_URL}/return/${dbOrderId}" 
          style="
            display: inline-block;
            background: #e74c3c;
            color: white;
            padding: 10px 20px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            font-size: 14px;
          "
        >
          Return Product
        </a>
      </div>
    `
    : "";

  return `
    <h2>maligaijaman – Payment Successful 🎉</h2>

    <p>Hello <b>${userName}</b>,</p>

    <p>Your order has been successfully placed.</p>

    <p><b>Order ID:</b> ${orderId}</p>

    <p>${rows}</p>

    <p>
      Subtotal: ₹${Number(subtotal).toFixed(2)}<br/>
      Tax: ₹${Number(tax).toFixed(2)}<br/>
      <b>Total Paid: ₹${Number(total).toFixed(2)}</b>
    </p>

    ${returnSection}

    <p>Thank you for shopping with <b>maligaijaman</b> 🙏</p>
  `;
};

export default orderEmailTemplate;