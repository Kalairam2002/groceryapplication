import Return from "../models/Return.js";

// Only these fields are ever sent to the delivery boy. Bank details and
// refund information stay with the seller — a delivery boy has no need
// for them, so they are deliberately NOT in this list.
const PICKUP_FIELDS =
  "productName reason description pickupStatus pickupAssignedAt pickupPickedUpAt pickupDeliveredAt orderId seller createdAt";

// Delivery boy moves a pickup forward one step at a time, in order.
const NEXT_PICKUP_STATUS = {
  Assigned: "Picked Up",
  "Picked Up": "Delivered to Seller",
};

// ✅ GET /api/delivery/my-returns
// Every return pickup assigned to the logged-in delivery boy.
export const getMyReturnPickups = async (req, res) => {
  try {
    const returns = await Return.find({
      pickupDeliveryBoy: req.deliveryBoy._id,
      pickupStatus: { $in: ["Assigned", "Picked Up", "Delivered to Seller"] },
    })
      .select(PICKUP_FIELDS)
      .populate("orderId", "deliveryAddress") // customer's address = where to collect from
      .populate("seller", "name phonenumber address") // seller = where to drop it off (no password/GST/etc.)
      .sort({ pickupAssignedAt: -1 });

    return res.status(200).json({ success: true, returns });
  } catch (error) {
    console.error("getMyReturnPickups error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ✅ PUT /api/delivery/returns/:returnId/status   body: { pickupStatus }
// Assigned -> Picked Up -> Delivered to Seller
export const updateReturnPickupStatus = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { pickupStatus } = req.body;

    // A delivery boy can only touch pickups assigned to him
    const returnDoc = await Return.findOne({
      _id: returnId,
      pickupDeliveryBoy: req.deliveryBoy._id,
    });
    if (!returnDoc) {
      return res.status(404).json({ success: false, message: "Return pickup not found" });
    }

    const expected = NEXT_PICKUP_STATUS[returnDoc.pickupStatus];
    if (!expected || pickupStatus !== expected) {
      return res.status(400).json({
        success: false,
        message: `Cannot change from "${returnDoc.pickupStatus}" to "${pickupStatus}"`,
      });
    }

    returnDoc.pickupStatus = pickupStatus;
    if (pickupStatus === "Picked Up") returnDoc.pickupPickedUpAt = new Date();
    if (pickupStatus === "Delivered to Seller") returnDoc.pickupDeliveredAt = new Date();
    await returnDoc.save();

    return res.status(200).json({
      success: true,
      message: `Marked as "${pickupStatus}"`,
      return: {
        _id: returnDoc._id,
        pickupStatus: returnDoc.pickupStatus,
        pickupPickedUpAt: returnDoc.pickupPickedUpAt,
        pickupDeliveredAt: returnDoc.pickupDeliveredAt,
      },
    });
  } catch (error) {
    console.error("updateReturnPickupStatus error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};