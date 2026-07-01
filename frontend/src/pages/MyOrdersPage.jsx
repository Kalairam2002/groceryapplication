import React from "react";
import ColorInit from "../helper/ColorInit";
import ScrollToTop from "react-scroll-to-top";
import Preloader from "../helper/Preloader";
import HeaderOne from "../components/HeaderOne";
import Breadcrumb from "../components/Breadcrumb";
import ShippingOne from "../components/ShippingOne";
import FooterOne from "../components/FooterOne";
import BottomFooter from "../components/BottomFooter";
import MyOrdersSection from "../components/MyOrdersSection";

function MyOrdersPage() {
  return (
    <>
      <ColorInit color={true} />
      <ScrollToTop smooth color='#FA6400' />
      <Preloader />
      <HeaderOne category={true} />
      <Breadcrumb title={"My Orders"} />
      <MyOrdersSection />
      <ShippingOne />
      <FooterOne />
      <BottomFooter />
    </>
  );
}

export default MyOrdersPage;