import React, { useEffect, useState } from "react";

function HeaderLocation() {
  const [address, setAddress] = useState("Detecting...");

  useEffect(() => {
    const getIpLocation = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data && data.city) {
          setAddress(`${data.city}, ${data.region}`);
        } else {
          setAddress("Location unavailable");
        }
      } catch (err) {
        console.error("Error fetching IP-based location:", err);
        setAddress("Location unavailable");
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;

          try {
            const res = await fetch(
              `${process.env.REACT_APP_API_URL}/api/loc/location?lat=${latitude}&lng=${longitude}`
            );
            const data = await res.json();
            if (data.address) {
              setAddress(data.address);
            } else {
              getIpLocation();
            }
          } catch (err) {
            console.error("Error fetching address:", err);
            getIpLocation();
          }
        },
        (err) => {
          console.error("Geolocation error code:", err.code, "message:", err.message);
          getIpLocation();
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0,
        }
      );
    } else {
      getIpLocation();
    }
  }, []);

  return (
    <span className="fw-bold text-white text-sm py-8 flex-align gap-6" style={{ color: "white" }}>
      <span className="icon text-md d-flex">
        <i className="ph ph-map-pin" />
      </span>{" "}
      <span>{address}</span>
    </span>
  );
}

export default HeaderLocation;