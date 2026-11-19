'use client';

import React, { useState } from 'react';
import SilkCanvas from '@/components/SilkCanvas';
import HeroSection from '@/components/HeroSection';
import InfoCards from '@/components/InfoCards';
import AboutSection from '@/components/AboutSection';
import AudioPlayer from '@/components/AudioPlayer';
import BookingSection from '@/components/BookingSection';
import Footer from '@/components/Footer';
import SpotlightController from '@/components/SpotlightController';

export default function HomePage() {
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);

  return (
    <>
      {/* خلفية القماش الحريري التفاعلية وشريط تقدم التمرير */}
      <SilkCanvas isMusicPlaying={isMusicPlaying} />

      <main id="top">
        {/* قسم البداية والبانر الرئيسي */}
        <HeroSection />

        {/* معلومات وتفاصيل موعد ومكان الحفل */}
        <InfoCards />

        {/* نبذة عن الأمسية */}
        <AboutSection />

        {/* مشغل أغنية البوشية الدائري التفاعلي */}
        <AudioPlayer onPlayingChange={setIsMusicPlaying} />

        {/* قسم باقات التذاكر ونموذج حجز وتسجيل بيانات الزائر */}
        <BookingSection />
      </main>

      {/* التذييل */}
      <Footer />

      {/* تحكم تأثيرات الإضاءة التفاعلية والانبثاق */}
      <SpotlightController />
    </>
  );
}
