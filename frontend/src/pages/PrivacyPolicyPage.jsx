
import React, { useRef } from "react";
import Preloader from "../helper/Preloader";
import HeaderOne from "../components/HeaderOne";
import BannerOne from "../components/BannerOne";
import FeatureOne from "../components/FeatureOne";
import PromotionalOne from "../components/PromotionalOne";
import FlashSalesOne from "../components/FlashSalesOne";
import ProductListOne from "../components/ProductListOne";
import OfferOne from "../components/OfferOne";
import RecommendedOne from "../components/RecommendedOne";
import HotDealsOne from "../components/HotDealsOne";
// import TopVendorsOne from "../components/TopVendorsOne";
import BestSellsOne from "../components/BestSellsOne";
import DeliveryOne from "../components/DeliveryOne";
import OrganicOne from "../components/OrganicOne";
import ShortProductOne from "../components/ShortProductOne";
import BrandOne from "../components/BrandOne";
import BrandTwo from "../components/BrandTwo";
import BrandThree from "../components/BrandThree";
import NewArrivalOne from "../components/NewArrivalOne";
import ShippingOne from "../components/ShippingOne";
import NewsletterOne from "../components/NewsletterOne";
import FooterOne from "../components/FooterOne";
import BottomFooter from "../components/BottomFooter";
import ScrollToTop from "react-scroll-to-top";
import ColorInit from "../helper/ColorInit";
import Subdata from "../components/Subdata";
import Categorydata from "../components/Categorydata";
import BrandData from "../components/BrandData";
import Privacypolicy from "../components/Privacypolicy";


const PrivacyPolicyPage = () => {
    const recommendedRef = useRef(null);
    const brandRef = useRef(null);


  // 2️⃣ Function to scroll smoothly
  const scrollToRecommended = () => {
    if (recommendedRef.current) {
      recommendedRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

    const scrollToBrands = () => {
    brandRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

  return (

    <>

      {/* Preloader */}
      <Preloader />

      {/* ScrollToTop */}
      <ScrollToTop smooth color="#299E60" />

      {/* ColorInit */}
      <ColorInit color={false} />

      {/* HeaderOne */}
      <HeaderOne onRecommendedClick={scrollToRecommended} 
      onBrandsClick={scrollToBrands}
      />

      <Privacypolicy />

      {/* FooterOne */}
      <FooterOne />

      {/* BottomFooter */}
      <BottomFooter />


    </>
  );
};

export default PrivacyPolicyPage;