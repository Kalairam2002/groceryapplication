import React from "react";
import Preloader from "../helper/Preloader";
import HeaderTwo from "../components/HeaderTwo";
import Breadcrumb from "../components/Breadcrumb";
// import ShopSection from "../components/ShopSection";
import ShippingTwo from "../components/ShippingTwo";
import FooterOne from "../components/FooterOne";
import ColorInit from "../helper/ColorInit";
import ScrollToTop from "react-scroll-to-top";
import HeaderOne from "../components/HeaderOne";
import { useParams } from "react-router-dom";
import  BrandSection  from "../components/BrandSection";


const BrandSectionPage = () => {  
  const { id } = useParams();

  return (
    <>
      {/* ColorInit */}
      <ColorInit color={true} />

      {/* ScrollToTop */}
      <ScrollToTop smooth color="#FA6400" />

      {/* Preloader */}
      <Preloader />

      {/* HeaderOne */}
      <HeaderOne category={true} />

      {/* Breadcrumb */}
      <Breadcrumb title={"Brand"} />

      {/* ShopSection */}
      {/* <ShopSection  id={id} /> */}
      <BrandSection />

      {/* ShippingTwo */}
      <ShippingTwo />

      {/* FooterTwo */}
      <FooterOne />


    </>
  );
};

export default BrandSectionPage;
