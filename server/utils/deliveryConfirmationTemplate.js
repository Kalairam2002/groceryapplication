const deliveryConfirmationTemplate = ({ userName, orderId, products, total, deliveryAddress, deliveryTimeSlot }) => {

  const rows = products
    .map(
      (item, index) => `
        ${index + 1}. ${item.name}<br/>
        Qty: ${item.quantity}<br/>
        Price: ₹${item.price}<br/>
        Total: ₹${item.price * item.quantity}<br/>
        <hr/>
      `
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      
      <div style="text-align: center; background: #1B5E20; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="color: #fff; margin: 0;">✅ Order Delivered Successfully!</h2>
      </div>

      <div style="padding: 24px;">
        <p>Hello <b>${userName}</b>,</p>
        <p>Great news! Your order has been <b style="color: #1B5E20;">successfully delivered</b> to you. We hope you enjoy your purchase!</p>
        <p><b>Order ID:</b> ${orderId}</p>

        <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 12px; color: #333;">🛍️ Delivered Items</h3>
          ${rows}
        </div>

        <div style="background: #f0f4ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 12px; color: #333;">📍 Delivered To</h3>
          <p style="margin: 0; line-height: 1.8; color: #555;">
            <b>${deliveryAddress?.fullName}</b><br/>
            📞 ${deliveryAddress?.phone}<br/>
            🏠 ${deliveryAddress?.address}
            ${deliveryAddress?.landmark ? `, Near ${deliveryAddress.landmark}` : ""}<br/>
            🏙️ ${deliveryAddress?.city}, ${deliveryAddress?.state}<br/>
            📮 ${deliveryAddress?.pincode}
          </p>
        </div>

        ${deliveryTimeSlot ? `
        <div style="background: #fff8e1; padding: 16px; border-radius: 8px; margin: 16px 0; text-align: center;">
          <p style="margin: 0 0 4px; font-size: 13px; color: #555;">Delivered During Time Slot</p>
          <h3 style="margin: 0; color: #f57f17;">🕐 ${deliveryTimeSlot}</h3>
        </div>
        ` : ""}

        <div style="background: #e8f5e9; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; font-size: 16px;"><b>Total Paid: ₹${total}</b></p>
        </div>

        <p style="color: #555; font-size: 14px;">If you have any issues with your order, please contact our support team.</p>
        <p>Thank you for shopping with <b>maligaijaman</b> 🙏</p>
      </div>

      <div style="text-align: center; background: #f5f5f5; padding: 14px; border-radius: 0 0 8px 8px; font-size: 12px; color: #888;">
        © 2025 maligaijaman. All rights reserved.
      </div>
    </div>
  `;
};

export default deliveryConfirmationTemplate;