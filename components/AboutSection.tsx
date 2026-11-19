import React from 'react';

export default function AboutSection() {
  return (
    <section id="about" className="shell about-section" aria-labelledby="about-title">
      <div className="about-card glass-box spotlight-card pop-card reveal is-visible">
        <h2 id="about-title" className="about-title">عن الأمسية</h2>
        <p className="about-desc">
          أمسية ثقافية وفنية نسائية استثنائية تجمع الأصالة السعودية بالفخامة العصرية في ليلة واحدة، تتألق باستعراض الأزياء التراثية، وكرم الضيافة والعشاء الفاخر، والحوارات الملهمة.
        </p>
      </div>
    </section>
  );
}
