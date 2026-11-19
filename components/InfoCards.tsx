import React from 'react';

export default function InfoCards() {
  return (
    <section id="details" className="shell" aria-label="معلومات الحفل">
      <div className="info-strip">
        <div className="info-item glass-box spotlight-card pop-card reveal is-visible">
          <span className="info-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
          </span>
          <div>
            <span className="info-label">موعد الحفل</span>
            <span className="info-value">يُعلن قريبًا</span>
          </div>
        </div>

        <div className="info-item glass-box spotlight-card pop-card reveal is-visible">
          <span className="info-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
          </span>
          <div>
            <span className="info-label">مكان الحفل</span>
            <span className="info-value">يُعلن قريبًا</span>
          </div>
        </div>

        <div className="info-item glass-box spotlight-card pop-card reveal is-visible">
          <span className="info-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
          </span>
          <div>
            <span className="info-label">الحجز</span>
            <span className="info-value">طلبات الحجز متاحة الآن</span>
          </div>
        </div>
      </div>
    </section>
  );
}
