import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/location", async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Latitude and longitude required" });
  }
  console.log("Fetching address for:", lat, lng);

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (data.results && data.results[0]) {
      res.json({ address: data.results[0].formatted_address });
    } else {
      res.json({ address: null });
    }
  } catch (err) {
    console.error("Error calling Google API:", err);
    res.status(500).json({ error: "Failed to fetch address" });
  }
});

export default router;
