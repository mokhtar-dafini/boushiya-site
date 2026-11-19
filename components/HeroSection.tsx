'use client';

import React from 'react';

export default function HeroSection() {
  return (
    <section className="hero" id="hero-section" aria-labelledby="hero-title">
      <div className="hero-stage" aria-hidden="true">
        <div className="hero-bg-media">
          <img
            id="concert-hero-image"
            className="hero-bg-photo"
            src="/hero-image.svg"
            alt="أجواء حفل البوشية التراثية"
          />
        </div>
        <div className="hero-spotlight"></div>
      </div>

      <div className="shell hero-inner">
        <div className="hero-copy">
          <h1 id="hero-title">
            <span className="hero-title-main">البُوشيًّــــة..</span>
            <span className="hero-title-sub">هيِبــة الذهـب</span>
          </h1>

          <p className="hero-desc">
            استعد لأمسية تنبض بالإيقاع والحماس ، ليلة سعودية خالصة وكل مافيها سعودي. اختر تذكرتك المفضلة وقدّم طلب حجزك لتكون جزءًا من هذه الليلة الاستثنائية.
          </p>

          <div className="hero-actions">
            <a className="primary-btn" href="#booking">
              <span>اطلب تذكرتك</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </a>
            <a className="text-link glass-box spotlight-card pop-card" href="#details">اكتشف التفاصيل ↓</a>
          </div>
        </div>
      </div>
    </section>
  );
}
