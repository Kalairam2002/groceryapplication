import React from 'react'
import { Link } from 'react-router-dom';
import Slider from 'react-slick';

const OrganicOne = () => {
    function SampleNextArrow(props) {
        const { className, onClick } = props;
        return (
            <button
                type="button" onClick={onClick}
                className={` ${className} slick-next slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1`}
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
                className={`${className} slick-prev slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1`}
            >
                <i className="ph ph-caret-left" />
            </button>
        );
    }
    const settings = {
        dots: false,
        arrows: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 6,
        slidesToScroll: 1,
        initialSlide: 0,
        autoplay: true,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
        responsive: [
            {
                breakpoint: 1599,
                settings: {
                    slidesToShow: 6,
                },
            },
            {
                breakpoint: 1399,
                settings: {
                    slidesToShow: 4,
                },
            },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: 575,
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 424,
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
    };
    return (
        <section className="organic-food py-80">
            <div className="container container-lg">
                <div className="section-heading">
                    <div className="flex-between flex-wrap gap-8">
                        <h5 className="mb-0">Organic Vegetables</h5>
                        <div className="flex-align mr-point gap-16">
                            <Link
                                to="/shop"
                                className="text-sm fw-medium text-gray-700 hover-text-main-600 hover-text-decoration-underline"
                            >
                                All Categories
                            </Link>

                        </div>
                    </div>
                </div>
                <div className="organic-food__slider arrow-style-two">
                    <Slider {...settings}>
                        <div>
                            <div className="product-card px-8 py-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
                                <Link
                                    to="/product-details"
                                    className="product-card__thumb flex-center"
                                >
                                    <img src="assets/images/thumbs/bro17.jpg" alt="" />
                                </Link>
                                <div className="product-card__content mt-12">
                                    <div className="flex-align gap-6">
                                        <span className="text-xs fw-bold text-gray-500">4.8</span>
                                        <span className="text-15 fw-bold text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-bold text-gray-500">(17k)</span>
                                    </div>
                                    <h6 className="title text-lg fw-semibold mt-12 mb-8">
                                        <Link to="/product-details" className="link text-line-2">
                                            Beetroot
                                        </Link>
                                    </h6>
                                    <div className="flex-align gap-4">
                                        <span className="text-main-600 text-md d-flex">
                                            <i className="ph-fill ph-storefront" />
                                        </span>
                                        <span className="text-gray-500 text-xs">
                                            By Lucky Supermarket
                                        </span>
                                    </div>
                                    <div className="flex-between gap-8 mt-24 flex-wrap">
                                        <div className="product-card__price">
                                            <span className="text-gray-400 text-md fw-semibold text-decoration-line-through d-block">
                                                $10.99
                                            </span>
                                            <span className="text-heading text-md fw-semibold ">
                                                $5.8 <span className="text-gray-500 fw-normal">/Qty</span>{" "}
                                            </span>
                                        </div>
                                        <Link
                                            to="/cart"
                                            className="product-card__cart btn bg-main-50 text-main-600 hover-bg-main-600 hover-text-white py-11 px-24 rounded-pill flex-align gap-8"
                                        >
                                            Add <i className="ph ph-shopping-cart" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="product-card px-8 py-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
                                <Link
                                    to="/product-details"
                                    className="product-card__thumb flex-center"
                                >
                                    <img src="assets/images/thumbs/bro16.jpg" alt="" />
                                </Link>
                                <div className="product-card__content mt-12">
                                    <div className="flex-align gap-6">
                                        <span className="text-xs fw-bold text-gray-500">4.8</span>
                                        <span className="text-15 fw-bold text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-bold text-gray-500">(17k)</span>
                                    </div>
                                    <h6 className="title text-lg fw-semibold mt-12 mb-8">
                                        <Link to="/product-details" className="link text-line-2">
                                            Spinach
                                        </Link>
                                    </h6>
                                    <div className="flex-align gap-4">
                                        <span className="text-main-600 text-md d-flex">
                                            <i className="ph-fill ph-storefront" />
                                        </span>
                                        <span className="text-gray-500 text-xs">
                                            By Lucky Supermarket
                                        </span>
                                    </div>
                                    <div className="flex-between gap-8 mt-24 flex-wrap">
                                        <div className="product-card__price">
                                            <span className="text-gray-400 text-md fw-semibold text-decoration-line-through d-block">
                                                $8.99
                                            </span>
                                            <span className="text-heading text-md fw-semibold ">
                                                $4.99 <span className="text-gray-500 fw-normal">/Qty</span>{" "}
                                            </span>
                                        </div>
                                        <Link
                                            to="/cart"
                                            className="product-card__cart btn bg-main-50 text-main-600 hover-bg-main-600 hover-text-white py-11 px-24 rounded-pill flex-align gap-8"
                                        >
                                            Add <i className="ph ph-shopping-cart" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="product-card px-8 py-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
                                <Link
                                    to="/product-details"
                                    className="product-card__thumb flex-center"
                                >
                                    <img src="assets/images/thumbs/bro15.jpg" alt="" />
                                </Link>
                                <div className="product-card__content mt-12">
                                    <div className="flex-align gap-6">
                                        <span className="text-xs fw-bold text-gray-500">4.8</span>
                                        <span className="text-15 fw-bold text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-bold text-gray-500">(17k)</span>
                                    </div>
                                    <h6 className="title text-lg fw-semibold mt-12 mb-8">
                                        <Link to="/product-details" className="link text-line-2">
                                           Cauliflower
                                        </Link>
                                    </h6>
                                    <div className="flex-align gap-4">
                                        <span className="text-main-600 text-md d-flex">
                                            <i className="ph-fill ph-storefront" />
                                        </span>
                                        <span className="text-gray-500 text-xs">
                                            By Lucky Supermarket
                                        </span>
                                    </div>
                                    <div className="flex-between gap-8 mt-24 flex-wrap">
                                        <div className="product-card__price">
                                            <span className="text-gray-400 text-md fw-semibold text-decoration-line-through d-block">
                                                $15.99
                                            </span>
                                            <span className="text-heading text-md fw-semibold ">
                                                $6.99 <span className="text-gray-500 fw-normal">/Qty</span>{" "}
                                            </span>
                                        </div>
                                        <Link
                                            to="/cart"
                                            className="product-card__cart btn bg-main-50 text-main-600 hover-bg-main-600 hover-text-white py-11 px-24 rounded-pill flex-align gap-8"
                                        >
                                            Add <i className="ph ph-shopping-cart" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="product-card px-8 py-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
                                <Link
                                    to="/product-details"
                                    className="product-card__thumb flex-center"
                                >
                                    <img src="assets/images/thumbs/bro11.jpg" alt="" />
                                </Link>
                                <div className="product-card__content mt-12">
                                    <div className="flex-align gap-6">
                                        <span className="text-xs fw-bold text-gray-500">4.8</span>
                                        <span className="text-15 fw-bold text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-bold text-gray-500">(17k)</span>
                                    </div>
                                    <h6 className="title text-lg fw-semibold mt-12 mb-8">
                                        <Link to="/product-details" className="link text-line-2">
                                            Garlic
                                        </Link>
                                    </h6>
                                    <div className="flex-align gap-4">
                                        <span className="text-main-600 text-md d-flex">
                                            <i className="ph-fill ph-storefront" />
                                        </span>
                                        <span className="text-gray-500 text-xs">
                                            By Lucky Supermarket
                                        </span>
                                    </div>
                                    <div className="flex-between gap-8 mt-24 flex-wrap">
                                        <div className="product-card__price">
                                            <span className="text-gray-400 text-md fw-semibold text-decoration-line-through d-block">
                                                $29.99
                                            </span>
                                            <span className="text-heading text-md fw-semibold ">
                                                $18.99 <span className="text-gray-500 fw-normal">/Qty</span>{" "}
                                            </span>
                                        </div>
                                        <Link
                                            to="/cart"
                                            className="product-card__cart btn bg-main-50 text-main-600 hover-bg-main-600 hover-text-white py-11 px-24 rounded-pill flex-align gap-8"
                                        >
                                            Add <i className="ph ph-shopping-cart" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="product-card px-8 py-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
                                <Link
                                    to="/product-details"
                                    className="product-card__thumb flex-center"
                                >
                                    <img src="assets/images/thumbs/bro12.jpg" alt="" />
                                </Link>
                                <div className="product-card__content mt-12">
                                    <div className="flex-align gap-6">
                                        <span className="text-xs fw-bold text-gray-500">4.8</span>
                                        <span className="text-15 fw-bold text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-bold text-gray-500">(15k)</span>
                                    </div>
                                    <h6 className="title text-lg fw-semibold mt-12 mb-8">
                                        <Link to="/product-details" className="link text-line-2">
                                            Potato
                                        </Link>
                                    </h6>
                                    <div className="flex-align gap-4">
                                        <span className="text-main-600 text-md d-flex">
                                            <i className="ph-fill ph-storefront" />
                                        </span>
                                        <span className="text-gray-500 text-xs">
                                            By Lucky Supermarket
                                        </span>
                                    </div>
                                    <div className="flex-between gap-8 mt-24 flex-wrap">
                                        <div className="product-card__price">
                                            <span className="text-gray-400 text-md fw-semibold text-decoration-line-through d-block">
                                                $21.99
                                            </span>
                                            <span className="text-heading text-md fw-semibold ">
                                                $11.99 <span className="text-gray-500 fw-normal">/Qty</span>{" "}
                                            </span>
                                        </div>
                                        <Link
                                            to="/cart"
                                            className="product-card__cart btn bg-main-50 text-main-600 hover-bg-main-600 hover-text-white py-11 px-24 rounded-pill flex-align gap-8"
                                        >
                                            Add <i className="ph ph-shopping-cart" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="product-card px-8 py-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
                                <Link
                                    to="/product-details"
                                    className="product-card__thumb flex-center"
                                >
                                    <img src="assets/images/thumbs/bro13.jpg" alt="" />
                                </Link>
                                <div className="product-card__content mt-12">
                                    <div className="flex-align gap-6">
                                        <span className="text-xs fw-bold text-gray-500">4.1</span>
                                        <span className="text-15 fw-bold text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-bold text-gray-500">(12k)</span>
                                    </div>
                                    <h6 className="title text-lg fw-semibold mt-12 mb-8">
                                        <Link to="/product-details" className="link text-line-2">
                                            Brinjal
                                        </Link>
                                    </h6>
                                    <div className="flex-align gap-4">
                                        <span className="text-main-600 text-md d-flex">
                                            <i className="ph-fill ph-storefront" />
                                        </span>
                                        <span className="text-gray-500 text-xs">
                                            By Lucky Supermarket
                                        </span>
                                    </div>
                                    <div className="flex-between gap-8 mt-24 flex-wrap">
                                        <div className="product-card__price">
                                            <span className="text-gray-400 text-md fw-semibold text-decoration-line-through d-block">
                                                $21.99
                                            </span>
                                            <span className="text-heading text-md fw-semibold ">
                                                $7.99 <span className="text-gray-500 fw-normal">/Qty</span>{" "}
                                            </span>
                                        </div>
                                        <Link
                                            to="/cart"
                                            className="product-card__cart btn bg-main-50 text-main-600 hover-bg-main-600 hover-text-white py-11 px-24 rounded-pill flex-align gap-8"
                                        >
                                            Add <i className="ph ph-shopping-cart" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="product-card px-8 py-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
                                <Link
                                    to="/product-details"
                                    className="product-card__thumb flex-center"
                                >
                                    <img src="assets/images/thumbs/bro14.jpg" alt="" />
                                </Link>
                                <div className="product-card__content mt-12">
                                    <div className="flex-align gap-6">
                                        <span className="text-xs fw-bold text-gray-500">4.8</span>
                                        <span className="text-15 fw-bold text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-bold text-gray-500">(17k)</span>
                                    </div>
                                    <h6 className="title text-lg fw-semibold mt-12 mb-8">
                                        <Link to="/product-details" className="link text-line-2">
                                            Cabbage
                                        </Link>
                                    </h6>
                                    <div className="flex-align gap-4">
                                        <span className="text-main-600 text-md d-flex">
                                            <i className="ph-fill ph-storefront" />
                                        </span>
                                        <span className="text-gray-500 text-xs">
                                            By Lucky Supermarket
                                        </span>
                                    </div>
                                    <div className="flex-between gap-8 mt-24 flex-wrap">
                                        <div className="product-card__price">
                                            <span className="text-gray-400 text-md fw-semibold text-decoration-line-through d-block">
                                                $28.99
                                            </span>
                                            <span className="text-heading text-md fw-semibold ">
                                                $14.99 <span className="text-gray-500 fw-normal">/Qty</span>{" "}
                                            </span>
                                        </div>
                                        <Link
                                            to="/cart"
                                            className="product-card__cart btn bg-main-50 text-main-600 hover-bg-main-600 hover-text-white py-11 px-24 rounded-pill flex-align gap-8"
                                        >
                                            Add <i className="ph ph-shopping-cart" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Slider>
                </div>
            </div>
        </section>

    )
}

export default OrganicOne