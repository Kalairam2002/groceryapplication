import React from 'react'
import { Link } from 'react-router-dom'

const cardImageWrapStyle = {
    position: 'relative',
    height: '220px',
    overflow: 'hidden',
}

const cardOverlayStyle = {
    position: 'absolute',
    inset: 0,
    background:
        'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.2) 40%, rgba(255,255,255,0) 60%)',
}

const cardTitleWrapStyle = {
    position: 'relative',
    zIndex: 1,
    padding: '20px',
}

const cardTitleTextStyle = {
    color: '#111',
    fontWeight: 700,
    margin: 0,
    textShadow: '0 1px 3px rgba(255,255,255,0.6)',
}

const cardFooterStyle = {
    padding: '16px',
    display: 'flex',
    justifyContent: 'center',
    borderTop: '1px solid #f0f0f0',
    background: '#fff',
}

const PromotionalOne = () => {
    return (
        <section className="promotional-banner pt-50">
            <div className="container container-lg">
                <div className="row gy-4">
                    <div className="col-xl-3 col-sm-6 col-xs-6">
                        <div className="promotional-banner-item rounded-24 overflow-hidden z-1 bg-white shadow-sm">
                            <div style={cardImageWrapStyle}>
                                <img
                                    src="assets/images/thumbs/meat1.jpg"
                                    alt=""
                                    className="position-absolute inset-block-start-0 inset-inline-start-0 w-100 h-100 object-fit-cover"
                                />
                                <div style={cardOverlayStyle} />
                                <div style={cardTitleWrapStyle}>
                                    <h6 className="promotional-banner-item__title text-32" style={cardTitleTextStyle}>
                                        Everyday Fresh Meat
                                    </h6>
                                </div>
                            </div>
                            <div style={cardFooterStyle}>
                                <Link
                                    to="/shop/6996a07b4e65aeb3be1b6c5c"
                                    className="btn btn-main d-inline-flex align-items-center rounded-pill gap-8"
                                >
                                    Shop Now
                                    <span className="icon text-xl d-flex">
                                        <i className="ph ph-arrow-right" />
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-sm-6 col-xs-6">
                        <div className="promotional-banner-item rounded-24 overflow-hidden z-1 bg-white shadow-sm">
                            <div style={cardImageWrapStyle}>
                                <img
                                    src="assets/images/thumbs/veg2.jpg"
                                    alt=""
                                    className="position-absolute inset-block-start-0 inset-inline-start-0 w-100 h-100 object-fit-cover"
                                />
                                <div style={cardOverlayStyle} />
                                <div style={cardTitleWrapStyle}>
                                    <h6 className="promotional-banner-item__title text-32" style={cardTitleTextStyle}>
                                        Daily Fresh Vegetables
                                    </h6>
                                </div>
                            </div>
                            <div style={cardFooterStyle}>
                                <Link
                                    to="/shop/6996a0964e65aeb3be1b6c5f"
                                    className="btn btn-main d-inline-flex align-items-center rounded-pill gap-8"
                                >
                                    Shop Now
                                    <span className="icon text-xl d-flex">
                                        <i className="ph ph-arrow-right" />
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-sm-6 col-xs-6">
                        <div className="promotional-banner-item rounded-24 overflow-hidden z-1 bg-white shadow-sm">
                            <div style={cardImageWrapStyle}>
                                <img
                                    src="assets/images/thumbs/milk.jpg"
                                    alt=""
                                    className="position-absolute inset-block-start-0 inset-inline-start-0 w-100 h-100 object-fit-cover"
                                />
                                <div style={cardOverlayStyle} />
                                <div style={cardTitleWrapStyle}>
                                    <h6 className="promotional-banner-item__title text-32" style={cardTitleTextStyle}>
                                        Everyday Fresh Milk
                                    </h6>
                                </div>
                            </div>
                            <div style={cardFooterStyle}>
                                <Link
                                    to="/shop/6996a0af4e65aeb3be1b6c62"
                                    className="btn btn-main d-inline-flex align-items-center rounded-pill gap-8"
                                >
                                    Shop Now
                                    <span className="icon text-xl d-flex">
                                        <i className="ph ph-arrow-right" />
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-sm-6 col-xs-6">
                        <div className="promotional-banner-item rounded-24 overflow-hidden z-1 bg-white shadow-sm">
                            <div style={cardImageWrapStyle}>
                                <img
                                    src="assets/images/thumbs/f1.jpg"
                                    alt=""
                                    className="position-absolute inset-block-start-0 inset-inline-start-0 w-100 h-100 object-fit-cover"
                                />
                                <div style={cardOverlayStyle} />
                                <div style={cardTitleWrapStyle}>
                                    <h6 className="promotional-banner-item__title text-32" style={cardTitleTextStyle}>
                                        Everyday Fresh Fruits
                                    </h6>
                                </div>
                            </div>
                            <div style={cardFooterStyle}>
                                <Link
                                    to="/shop/6996a0d14e65aeb3be1b6c65"
                                    className="btn btn-main d-inline-flex align-items-center rounded-pill gap-8"
                                >
                                    Shop Now
                                    <span className="icon text-xl d-flex">
                                        <i className="ph ph-arrow-right" />
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    )
}

export default PromotionalOne