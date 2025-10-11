import React from 'react'
import { BsTypeH6 } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import Slider from "react-slick";
const BannerOne = () => {

    function SampleNextArrow(props) {
        const { className, onClick } = props;
        return (
            <button
                type="button" onClick={onClick}
                className={` ${className} slick-next slick-arrow flex-center rounded-circle bg-white text-xl hover-bg-main-600 hover-text-white transition-1`}
            >
                <i className="ph ph-caret-right" />
            </button>
        );
    }
    function SamplePrevArrow(props) {
        const { className, onClick } = props;

        return (

            <button
                type="button"
                onClick={onClick}
                className={`${className} slick-prev slick-arrow flex-center rounded-circle bg-white text-xl hover-bg-main-600 hover-text-white transition-1`}
            >
                <i className="ph ph-caret-left" />
            </button>
        );
    }
    const settings = {
        dots: false,
        arrows: true,
        infinite: true,
        speed: 1500,
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 0,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,


    };
    return (
//         <div className="banner  ">
//             <div className="container container-lg  ">
//                 <div className="banner-item rounded-24 overflow-hidden position-relative arrow-center " style={{paddingTop: "10px" , height:"400px"}}  >
//                     <a
//                         href="#featureSection"
//                         className="scroll-down w-84 h-84 text-center flex-center bg-main-600 rounded-circle border border-5 text-white border-white position-absolute start-50 translate-middle-x bottom-0 hover-bg-main-800"
//                     >
//                         <span className="icon line-height-0">
//                             <i className="ph ph-caret-double-down" />
//                         </span>
//                     </a>
//                     <img
//                         src="/assets/images/bg/seven.jpg"
//                         //src=" "
//                         alt="img"
//                         className="banner-img position-absolute inset-block-start-0 inset-inline-start-0 w-100 h-100 z-n1 object-fit-cover rounded-24"
//                     />
//                     <div className="flex-align">


//                     </div>
//                     <div className="banner-slider  "    >
//                         <Slider {...settings}>
//                             <div className="banner-slider__item "   >
//                                 <div className="banner-slider__inner flex-between position-relative" >
//                                     <div className="">
//                                         <h6 className="" style={{ fontSize: "30px" }}>
//                                             Exclusive deals on fruits, veggies, and daily needs. Fresh quality at unbeatable prices.
//                                         </h6>
//                                         {/* <Link
//                                             to="/shop"
//                                             className="btn btn-main d-inline-flex align-items-center rounded-pill gap-8"
//                                         >
//                                             Explore Shop{" "}
//                                             <span className="icon text-xl d-flex">
//                                                 <i className="ph ph-shopping-cart-simple" />{" "}
//                                             </span>
//                                         </Link> */}
//                                     </div>
//                                     <div className="">
//   <img src="assets/images/bg/12.png" alt="" style={{ width: "500px", height: "auto" }} />
// </div>
//                                 </div>
//                             </div>
//                             <div className="banner-slider__item">
//                                 <div className="banner-slider__inner flex-between position-relative">
//                                     {/* banner-item__content */}
//                                     <div className="">
//                                         <h6 className="" style={{ fontSize: "30px" }}>
//                                           From handpicked fruits and vegetables to all your kitchen essentials — shop smarter and spend less.
//                                         </h6>
//                                         {/* <Link
//                                             to="/shop"
//                                             className="btn btn-main d-inline-flex align-items-center rounded-pill gap-8"
//                                         >
//                                             Explore Shop{" "}
//                                             <span className="icon text-xl d-flex">
//                                                 <i className="ph ph-shopping-cart-simple" />{" "}
//                                             </span>
//                                         </Link> */}
//                                     </div>
//                                     <div className="">
//                                         <img src="assets/images/bg/eleven.png" alt="" style={{ width: "500px", height: "auto" }} />
//                                     </div>
//                                 </div>
//                             </div>
//                                                         <div className="banner-slider__item">
//                                 <div className="banner-slider__inner flex-between position-relative">
//                                     <div className="">
//                                         <h6 className="" style={{ fontSize: "30px" }}>
//                                            Your favorite groceries, delivered fast and FREE — straight to your door.
//                                         </h6>
//                                         {/* <Link
//                                             to="/shop"
//                                             className="btn btn-main d-inline-flex align-items-center rounded-pill gap-8"
//                                         >
//                                             Explore Shop{" "}
//                                             <span className="icon text-xl d-flex">
//                                                 <i className="ph ph-shopping-cart-simple" />{" "}
//                                             </span>
//                                         </Link> */}
//                                     </div>
//                                     <div className="banner-item__thumb">
//                                         <img src="assets/images/bg/13.png" alt="" style={{ width: "300px", height: "auto" }} />
//                                     </div>
//                                 </div>
//                             </div>
//                         </Slider>
//                     </div>
//                 </div>
//             </div>
//         </div>
 <div className="banner  ">
            <div className="container container-lg  ">
                <div className="banner-item rounded-24 overflow-hidden position-relative arrow-center " style={{paddingTop: "10px" , height:"400px"}}  >
                    <a
                        href="#featureSection"
                        className="scroll-down w-84 h-84 text-center flex-center bg-main-600 rounded-circle border border-5 text-white border-white position-absolute start-50 translate-middle-x bottom-0 hover-bg-main-800"
                    >
                        <span className="icon line-height-0">
                            <i className="ph ph-caret-double-down" />
                        </span>
                    </a>
                    <img
                        src="/assets/images/bg/seven.jpg"
                        //src=" "
                        alt="img"
                        className="banner-img position-absolute inset-block-start-0 inset-inline-start-0 w-100 h-100 z-n1 object-fit-cover rounded-24" 
                    />
                    <div className="flex-align">


                    </div>
                    <div className="banner-slider  "    >
                        <Slider {...settings}>
                            <div className="banner-slider__item "   >
                                <div className="banner-slider__inner flex-between position-relative" style={{fontSize:'27px', paddingTop:"40px", bottom: "65px", position: "absolute", marginRight: "80px"}}>
                                    <div className="">
                                        <h6 className="" style={{ fontSize: "30px" }}>
                                            Exclusive deals on fruits, veggies, and daily needs. Fresh quality at unbeatable prices.
                                        </h6>
                                        <Link
                                            to="/shop"
                                            className="btn btn-main d-inline-flex align-items-center rounded-pill gap-8"
                                        >
                                            Explore Shop{" "}
                                            <span className="icon text-xl d-flex">
                                                <i className="ph ph-shopping-cart-simple" />{" "}
                                            </span>
                                        </Link>
                                    </div>
                                    <div className="">
  <img src="assets/images/bg/12.png" alt="" style={{ width: "700px", height: "auto" }} />
</div>
                                </div>
                            </div>
                            <div className="banner-slider__item">
                                <div className="banner-slider__inner flex-between position-relative">
                                    {/* banner-item__content */}
                                    <div className="">
                                        <h6 className="" style={{ fontSize: "30px" }}>
                                          From handpicked fruits and vegetables to all your kitchen essentials — shop smarter and spend less.
                                        </h6>
                                        {/* <Link
                                            to="/shop"
                                            className="btn btn-main d-inline-flex align-items-center rounded-pill gap-8"
                                        >
                                            Explore Shop{" "}
                                            <span className="icon text-xl d-flex">
                                                <i className="ph ph-shopping-cart-simple" />{" "}
                                            </span>
                                        </Link> */}
                                    </div>
                                    <div className="">
                                        <img src="assets/images/bg/eleven.png" alt="" style={{ width: "500px", height: "auto" }} />
                                    </div>
                                </div>
                            </div>
                                                        <div className="banner-slider__item">
                                <div className="banner-slider__inner flex-between position-relative">
                                    <div className="">
                                        <h6 className="" style={{ fontSize: "30px" }}>
                                           Your favorite groceries, delivered fast and FREE — straight to your door.
                                        </h6>
                                        {/* <Link
                                            to="/shop"
                                            className="btn btn-main d-inline-flex align-items-center rounded-pill gap-8"
                                        >
                                            Explore Shop{" "}
                                            <span className="icon text-xl d-flex">
                                                <i className="ph ph-shopping-cart-simple" />{" "}
                                            </span>
                                        </Link> */}
                                    </div>
                                    <div className="banner-item__thumb">
                                        <img src="assets/images/bg/13.png" alt="" style={{ width: "300px", height: "auto" }} />
                                    </div>
                                </div>
                            </div>
                        </Slider>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default BannerOne