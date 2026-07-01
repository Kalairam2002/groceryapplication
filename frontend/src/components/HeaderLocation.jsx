import React, { useEffect, useState } from "react";

function HeaderLocation() {
  const [address, setAddress] = useState("Detecting...");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;

          try {
            // Call your backend route that talks to Google API
            const res = await fetch(
              `${process.env.REACT_APP_API_URL}/api/loc/location?lat=${latitude}&lng=${longitude}`
            );
            const data = await res.json();
            setAddress(data.address || "Location unavailable");
          } catch (err) {
            console.error("Error fetching address:", err);
            setAddress("Location unavailable");
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          setAddress("Permission denied");
        }
      );
    } else {
      setAddress("Geolocation not supported");
    }
  }, []);

  return <span className="fw-bold text-white text-sm py-8 flex-align gap-6" style={{ color: "white" }}>
      <span className="icon text-md d-flex">
                        <i className="ph ph-map-pin" /> 
      </span> <span>{address}</span>
    
    
    </span>;
}

export default HeaderLocation;
