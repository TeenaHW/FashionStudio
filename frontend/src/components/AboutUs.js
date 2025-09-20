import React from 'react';
import '../App.css';

function AboutUs() {
    return (
        <div className="fashion-about">
            {/* Hero Section */}
            <section className="fashion-hero text-white py-5">
                <div className="container">
                    <h1 className="display-4 mb-4">Our Fashion Story</h1>
                    <p className="lead">
                        Where Elegance Meets Contemporary Style
                    </p>
                </div>
            </section>
            
            <div className="container my-5">
                {/* Our Vision */}
                <section className="mb-5">
                    <div className="row">
                        <div className="col-12">
                            <h2 className="mb-4 text-center">Our Vision</h2>
                            <div className="vision-content p-4" style={{backgroundColor: '#f9f9f9', borderRadius: '8px'}}>
                                <p className="lead">
                                    We believe fashion is a form of self-expression. Our designs blend timeless elegance 
                                    with contemporary trends, creating pieces that empower and inspire confidence in 
                                    every individual who wears them.
                                </p>
                                <p className="mt-3">
                                    At our core, we are committed to sustainable fashion that doesn't compromise on style or quality. 
                                    Each collection is thoughtfully designed to be versatile, allowing you to mix and match pieces 
                                    for endless styling possibilities.
                                </p>
                                <p className="mt-3">
                                    We envision a world where fashion is both beautiful and responsible, where every garment tells 
                                    a story of craftsmanship and care. Our designs celebrate diversity and individuality, 
                                    offering something special for every body type and personal style.
                                </p>
                                <p className="mt-3">
                                    Join us on this journey of redefining modern elegance, one exquisite piece at a time. 
                                    Because you deserve to look and feel your absolute best, every single day.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Our Values */}
                <section className="mb-5 py-4">
                    <h2 className="text-center mb-5">Our Core Values</h2>
                    <div className="row g-4">
                        <div className="col-md-3 text-center">
                            <div className="value-icon">✨</div>
                            <h5>Quality Craftsmanship</h5>
                            <p>Meticulous attention to detail in every stitch</p>
                        </div>
                        <div className="col-md-3 text-center">
                            <div className="value-icon">🌱</div>
                            <h5>Sustainable Fashion</h5>
                            <p>Eco-friendly materials and ethical production</p>
                        </div>
                        <div className="col-md-3 text-center">
                            <div className="value-icon">🎨</div>
                            <h5>Innovative Design</h5>
                            <p>Pushing boundaries with creative vision</p>
                        </div>
                        <div className="col-md-3 text-center">
                            <div className="value-icon">💝</div>
                            <h5>Customer Love</h5>
                            <p>Exceptional service and perfect fit</p>
                        </div>
                    </div>
                </section>

                {/* Our Collections */}
                <section className="mb-5">
                    <h2 className="mb-4">Our Collections</h2>
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="collection-card">
                                <h5>Evening Wear</h5>
                                <p>Elegant gowns and sophisticated evening attire</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="collection-card">
                                <h5>Casual Chic</h5>
                                <p>Everyday wear with a touch of elegance</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="collection-card">
                                <h5>Bridal Couture</h5>
                                <p>Dream wedding dresses and bridal accessories</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Our Promise */}
                <section className="mb-5 p-4 fashion-promise">
                    <h2 className="mb-4 text-center">Our Promise to You</h2>
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="p-3">
                                <h5>Premium Fabrics</h5>
                                <p>Only the finest materials for lasting comfort and style</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="p-3">
                                <h5>Perfect Fit</h5>
                                <p>Expert tailoring for a flawless fit every time</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="p-3">
                                <h5>Exceptional Service</h5>
                                <p>Dedicated customer support for a seamless shopping experience</p>
                                <p>Worldwide delivery for homes & businesses</p>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}

export default AboutUs;