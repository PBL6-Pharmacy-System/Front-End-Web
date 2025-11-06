import React, { useState, useEffect } from 'react';
import './BannerSlider.css';

export default function BannerSlider() {
  // Mock data - sẽ thay bằng data từ database
  const banners = [
    { id: 1, title: "Banner 1", image: "1" },
    { id: 2, title: "Banner 2", image: "2" },
    { id: 3, title: "Banner 3", image: "3" },
    { id: 4, title: "Banner 4", image: "4" },
    { id: 5, title: "Banner 5", image: "5" }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Auto slide
  useEffect(() => {
    if (!isAutoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlay, banners.length]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="banner-slider">
      <div className="slider-container">
        {/* Main Banner */}
        <div 
          className="slides-wrapper"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
        >
          {banners.map((banner, index) => (
            <div key={banner.id} className="slide">
              <div className="banner-content">
                <div className="banner-number">{banner.image}</div>
                <div className="banner-info">
                  <h3>Banner {banner.image}</h3>
                  <p>Mô tả cho banner {banner.image}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button 
          className="nav-arrow nav-prev" 
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <button 
          className="nav-arrow nav-next" 
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="dots-container">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Side Banners */}
      <div className="side-banners">
        <div className="side-banner">
          <div className="side-banner-content">
            <div className="side-banner-number">A</div>
            <div className="side-banner-info">
              <h4>Side Banner A</h4>
              <p>Mô tả ngắn</p>
            </div>
          </div>
        </div>
        <div className="side-banner">
          <div className="side-banner-content">
            <div className="side-banner-number">B</div>
            <div className="side-banner-info">
              <h4>Side Banner B</h4>
              <p>Mô tả ngắn</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}