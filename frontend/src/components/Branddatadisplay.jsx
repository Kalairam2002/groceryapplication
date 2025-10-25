import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Brandsdisplay.css"; // Import the CSS file for styling

const Branddatadisplay = () => {
  const {
    data: brandsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/brand`);
      return response.data;
    },
  });

  if (isLoading) return <p className="status-text">Loading brands...</p>;
  if (isError) return <p className="status-text error">Error: {error?.message}</p>;

  const brands = Array.isArray(brandsData?.brands) ? brandsData.brands : [];

  if (brands.length === 0) return <p className="status-text">No brands found.</p>;

  return (
    <div className="brands-container">
      {brands.map((brand) => (
        <div className="brand-card" key={brand?._id || Math.random()}>
          <div className="brand-image-wrapper">
            <Link  to={`/brandlist/${brand._id}`} >
            <img
              src={brand?.image || "/placeholder.png"}
              alt={brand?.name || "Brand"}
              onError={(e) => (e.currentTarget.src = "/placeholder.png")}
              loading="lazy"
            />
            </Link>
          </div>
          <p className="brand-name">{brand?.name || "Unnamed Brand"}</p>
        </div>
      ))}
    </div>
  );
};

export default Branddatadisplay;
