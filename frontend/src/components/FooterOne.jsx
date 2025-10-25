import React from 'react'
import { Link } from 'react-router-dom'

const FooterOne = () => {
    return (
        <footer className="footer py-50" style={{marginTop:"30px", boxShadow:"0 4px 10px rgba(0,0,0,0.1)" ,  backgroundColor:"#4CAF50",paddingTop:"40px"}}>
            <img
                src="assets/images/bg/body-bottom-bg.png"
                alt="BG"
                className="body-bottom-bg"
            />
            <div className="container container-lg">
                <div className="footer-item-wrapper d-flex  justify-content-around flex-wrap">
                    <div className="footer-item">
                        <div className="footer-item__logo">
                            <Link to="/">
                                {" "}
                                <img src="../../assets/images/logo/logo.png" alt="" />
                            </Link>
                        </div>
                        <p className="mb-24 text-md text-gray-900" >
                           <b> We're Grocery Shop, an innovative team of food supliers.</b>
                        </p>
                        <div className="flex-align gap-16 mb-16">
                            <span className="w-32 h-32 flex-center rounded-circle bg-main-600 text-white text-md flex-shrink-0">
                                <i className="ph-fill ph-map-pin" />
                            </span>
                            <span className="text-white hover:text-gray-200 transition-colors duration-300 ">
                               <b><i>Instaspace, Near Kotak Mahindar Bank, Hosur -6335126.</i></b>
                            </span>
                        </div>
                        <div className="flex-align gap-16 mb-16">
                            <span className="w-32 h-32 flex-center rounded-circle bg-main-600 text-white text-md flex-shrink-0">
                                <i className="ph-fill ph-phone-call" />
                            </span>
                            <div className="flex-align gap-16 flex-wrap">
                                <Link
                                    to="/tel:+91 8682860385"
                                    className="text-white hover:text-gray-200 transition-colors duration-300"
                                >
                                     <b><i>+91 8682860385</i></b>
                                </Link>
                                <span className="text-md text-gray-900  "><b>or</b></span>
                                <Link
                                    to="/tel: +91 7845298544"
                                    className="text-white hover:text-gray-200 transition-colors duration-300"
                                >
                                     <b><i>+91 7845298544</i></b>
                                </Link>
                            </div>
                        </div>
                        <div className="flex-align gap-16 mb-16">
                            <span className="w-32 h-32 flex-center rounded-circle bg-main-600 text-white text-md flex-shrink-0">
                                <i className="ph-fill ph-envelope" />
                            </span>
                            <Link
                                to="/mailto:support24@marketpro.com"
                                className="text-white hover:text-gray-200 transition-colors duration-300"
                            >
                                <b><i>info@rdegi.com</i></b>
                            </Link>
                        </div>
                    </div>
                    <div className="footer-item">
                        <h6 className="footer-item__title">Details</h6>
                        <ul className="footer-menu">
                            <li className="mb-16" >
                                <Link to="/seller" className="text-white hover:text-gray-200 transition-colors duration-300" >  
                                    Become a Vendor
                                </Link>
                            </li>
                           
                            <li className="mb-16" >
                                <Link to="/shop" className="text-white hover:text-gray-200 transition-colors duration-300" >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li className="mb-16" >
                                <Link to="/seller-details" className="text-white hover:text-gray-200 transition-colors duration-300" >
                                    Our Suppliers
                                </Link>
                            </li>
                            
                            
                        </ul>
                    </div>
                    <div className="footer-item">
                        <h6 className="footer-item__title">Customer Support</h6>
                        <ul className="footer-menu">
                            <li className="mb-16">
                                <Link to="/contact" className="text-white hover:text-gray-200 transition-colors duration-300">
                                    Help Center
                                </Link>
                            </li>
                            
                            <li className="mb-16">
                                <Link to="/shop" className="text-white hover:text-gray-200 transition-colors duration-300">
                                    Policies &amp; Rules
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="footer-item">
                        <h6 className="footer-item__title">My Account</h6>
                        <ul className="footer-menu">
                            <li className="mb-16">
                                <Link to="/account" className="text-white hover:text-gray-200 transition-colors duration-300">
                                    My Account
                                </Link>
                            </li>
                            <li className="mb-16">
                                <Link to="/wishlist" className="text-white hover:text-gray-200 transition-colors duration-300">
                                    Order History
                                </Link>
                            </li>
                            <li className="mb-16">
                                <Link to="/cart" className="text-white hover:text-gray-200 transition-colors duration-300">
                                    Shopping Cart
                                </Link>
                            </li>
                            <li className="mb-16">
                                <Link to="/shop" className="    text-white hover:text-gray-200 transition-colors duration-300">
                                    Compare
                                </Link>
                            </li>
                            {/* <li className="">
                                <Link to="/wishlist" className="ttext-white hover:text-gray-200 transition-colors duration-300">
                                    Wishlist
                                </Link>
                            </li> */}
                        </ul>
                    </div>
                   
                    {/* <div className="footer-item">
                        <h6 className="">Shop on The Go</h6>
                        <p className="mb-16">Marketpro App is available. Get it now</p>
                        <div className="flex-align gap-8 my-32">
                            <Link to="/https://www.apple.com/store" className="">
                                <img src="assets/images/thumbs/store-img1.png" alt="" />
                            </Link>
                            <Link to="/https://play.google.com/store/apps?hl=en" className="">
                                <img src="assets/images/thumbs/store-img2.png" alt="" />
                            </Link>
                        </div>
                        <ul className="flex-align gap-16">
                            <li>
                                <Link
                                    to="/https://www.facebook.com"
                                    className="w-44 h-44 flex-center bg-main-100 text-main-600 text-xl rounded-circle hover-bg-main-600 hover-text-white"
                                >
                                    <i className="ph-fill ph-facebook-logo" />
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/https://www.twitter.com"
                                    className="w-44 h-44 flex-center bg-main-100 text-main-600 text-xl rounded-circle hover-bg-main-600 hover-text-white"
                                >
                                    <i className="ph-fill ph-twitter-logo" />
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/https://www.linkedin.com"
                                    className="w-44 h-44 flex-center bg-main-100 text-main-600 text-xl rounded-circle hover-bg-main-600 hover-text-white"
                                >
                                    <i className="ph-fill ph-instagram-logo" />
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/https://www.pinterest.com"
                                    className="w-44 h-44 flex-center bg-main-100 text-main-600 text-xl rounded-circle hover-bg-main-600 hover-text-white"
                                >
                                    <i className="ph-fill ph-linkedin-logo" />
                                </Link>
                            </li>
                        </ul>
                    </div> */}
                </div>
            </div>
        </footer>

    )
}

export default FooterOne