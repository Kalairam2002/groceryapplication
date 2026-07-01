import axios from "axios";

export const sendWhatsAppMessage = async (phone, userName, orderId, amount) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
        name: "order_confirmation_dynamic",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: userName },
              { type: "text", text: orderId },
              { type: "text", text: `₹${amount}` }
            ]
          }
        ]
      }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ WhatsApp sent");

  } catch (err) {
    console.log("❌ WhatsApp Error:", err.response?.data || err.message);
  }
};
