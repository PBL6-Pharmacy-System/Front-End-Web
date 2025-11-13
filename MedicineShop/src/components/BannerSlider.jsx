import React, { useState, useEffect } from 'react';
import './BannerSlider.css';

export default function BannerSlider() {
  // Banner động (4 ảnh cuối)
  const dynamicBanners = [
    { 
      id: 1, 
      title: "Banner PC 1", 
      image: "/banners/Banner_Web_PC_805x246_08bf786c89.png" 
    },
    { 
      id: 2, 
      title: "Banner PC 2", 
      image: "/banners/Banner_Web_PC_805x246_77941da2d1.png" 
    },
    { 
      id: 3, 
      title: "Desktop Banner 1", 
      image: "/banners/D_H1_Desktop_1200x367_3053759f45.png" 
    },
    { 
      id: 4, 
      title: "Desktop Banner 2", 
      image: "/banners/D_H1_Desktop_1200x367_8ba0bd390a.png" 
    }
  ];

  // Banner tĩnh (2 ảnh đầu)
  const staticBanners = [
    {
      id: 1,
      title: "Banner H2",
      image: "/banners/Banner_H2_1_6d86dbb69f.png"
    },
    {
      id: 2,
      title: "Banner Ung Thư",
      image: "/banners/Banner_Ung_Thu_1_185705d391.jpg"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Auto slide
  useEffect(() => {
    if (!isAutoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % dynamicBanners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlay, dynamicBanners.length]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % dynamicBanners.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + dynamicBanners.length) % dynamicBanners.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="banner-slider">
      <div className="slider-container">
        {/* Main Banner - Dynamic Slider */}
        <div 
          className="slides-wrapper"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
        >
          {dynamicBanners.map((banner) => (
            <div key={banner.id} className="slide">
              <img 
                src={banner.image} 
                alt={banner.title}
                className="banner-image"
              />
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
          {dynamicBanners.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Side Banners - Static */}
      <div className="side-banners">
        {staticBanners.map((banner) => (
          <div key={banner.id} className="side-banner">
            <img 
              src={banner.image} 
              alt={banner.title}
              className="side-banner-image"
            />
          </div>
        ))}
      </div>
    </div>
  );
}