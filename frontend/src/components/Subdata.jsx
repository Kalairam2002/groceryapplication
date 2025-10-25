import React from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const Subdata = () => {
  const { data: subcategorydata, isLoading } = useQuery({
    queryKey: ["subcategorydatakey"],
    queryFn: async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/subcategory`);
      return response.data;
    },
  });

  const SampleNextArrow = (props) => {
    const { onClick } = props;
    return (
      <div
        onClick={onClick}
        style={{
          background: "white",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          right: "-20px",
          top: "40%",
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          zIndex: 2,
        }}
      >
        <i className="ph ph-caret-right" style={{ fontSize: "20px", color: "#333" }}></i>
      </div>
    );
  };

  const SamplePrevArrow = (props) => {
    const { onClick } = props;
    return (
      <div
        onClick={onClick}
        style={{
          background: "white",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          left: "-20px",
          top: "40%",
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          zIndex: 2,
        }}
      >
        <i className="ph ph-caret-left" style={{ fontSize: "20px", color: "#333" }}></i>
      </div>
    );
  };

  const settings = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 600,
    slidesToShow: 5,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 4 } },
      { breakpoint: 992, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div style={{ padding: "70px 0", background: "#f8f9fa" }}>
      <div style={{ width: "100%", margin: "0 auto" }}>
        <div
          style={{
            background: "linear-gradient(to right, #56ab2f, #a8e063, #6bbf59, #9ce88f, #3a7d44)",

            padding: "40px 30px",
            borderRadius: "20px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "24px", color: "#333", fontWeight: "700" }}>
              Shop by Subcategory
            </h2>
            {/* <Link
              to="/Brand"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#444",
                textDecoration: "none",
              }}
            >
              View All →
            </Link> */}
          </div>

          <Slider {...settings}>
            {!isLoading &&
              subcategorydata &&
              subcategorydata.map((brand) => (
                <div key={brand._id} style={{ padding: "10px" }}  >
                  <div
                    style={{
                      background: "white",
                      borderRadius: "16px",
                      boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                      textAlign: "center",
                      padding: "20px 15px",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.05)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  >
                    <div
                      style={{
                        width: "150px",
                        height: "150px",
                        margin: "0 auto",
                        overflow: "hidden",
                        borderRadius: "12px",
                      }}
                    >
                      <Link to={`/subcategory/${brand._id}`}>
                      <img
                        src={brand.image}
                        alt={brand.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          transition: "transform 0.3s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "scale(1.15)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                      />
                      </Link>
                    </div>
                    <p
                      style={{
                        marginTop: "15px",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      <Link to={`/subcategory/${brand._id}`}>
                      {brand.name}
                      </Link>
                    </p>
                  </div>
                </div>
              ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default Subdata;
