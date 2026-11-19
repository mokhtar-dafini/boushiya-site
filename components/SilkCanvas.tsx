'use client';

import React, { useEffect, useRef } from 'react';

interface SilkCanvasProps {
  isMusicPlaying?: boolean;
}

export default function SilkCanvas({ isMusicPlaying = false }: SilkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const isPlayingRef = useRef(isMusicPlaying);

  useEffect(() => {
    isPlayingRef.current = isMusicPlaying;
  }, [isMusicPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    let pointerX = width * 0.5;
    let pointerY = height * 0.4;
    let smoothX = pointerX;
    let smoothY = pointerY;

    let heroPointerX = 0;
    let heroPointerY = 0;
    let smoothHeroX = 0;
    let smoothHeroY = 0;

    const heroSection = document.getElementById('hero-section');

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    function onMove(x: number, y: number) {
      pointerX = x;
      pointerY = y;
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        if (rect.bottom > 0) {
          const rx = (x - rect.left) / rect.width - 0.5;
          const ry = (y - rect.top) / rect.height - 0.5;
          heroPointerX = rx * -22;
          heroPointerY = ry * -14;
        }
      }
    }

    const handlePointerMove = (e: PointerEvent) => onMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleScroll = () => {
      if (!progressRef.current) return;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current.style.width = docHeight > 0 ? `${(window.scrollY / docHeight) * 100}%` : '0%';
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    const silkRibbons = [
      { yRatio: 0.22, amp: 38, freq: 0.0022, speed: 0.014, alpha: 0.12, thickness: 150 },
      { yRatio: 0.42, amp: 48, freq: 0.0018, speed: -0.011, alpha: 0.10, thickness: 180 },
      { yRatio: 0.62, amp: 42, freq: 0.0025, speed: 0.016, alpha: 0.11, thickness: 160 },
      { yRatio: 0.80, amp: 35, freq: 0.0020, speed: -0.013, alpha: 0.09, thickness: 140 },
      { yRatio: 0.92, amp: 28, freq: 0.0028, speed: 0.018, alpha: 0.08, thickness: 120 }
    ];

    let time = 0;
    let animId: number;

    function renderLoop() {
      time += isPlayingRef.current ? 1.5 : 1;

      smoothX += (pointerX - smoothX) * 0.06;
      smoothY += (pointerY - smoothY) * 0.06;
      smoothHeroX += (heroPointerX - smoothHeroX) * 0.05;
      smoothHeroY += (heroPointerY - smoothHeroY) * 0.05;

      if (heroSection) {
        const autoX = Math.sin(time * 0.015) * 11 + Math.cos(time * 0.008) * 5;
        const autoY = Math.cos(time * 0.012) * 7;
        const autoScale = 1.06 + Math.sin(time * 0.01) * 0.018;

        const totalHeroX = autoX + smoothHeroX;
        const totalHeroY = autoY + smoothHeroY;

        heroSection.style.setProperty('--hero-x', `${totalHeroX.toFixed(2)}px`);
        heroSection.style.setProperty('--hero-y', `${totalHeroY.toFixed(2)}px`);
        heroSection.style.setProperty('--hero-scale', autoScale.toFixed(4));

        const spotX = 32 + Math.sin(time * 0.014) * 14 + (smoothHeroX * -0.8);
        const spotY = 45 + Math.cos(time * 0.011) * 12 + (smoothHeroY * -0.8);
        heroSection.style.setProperty('--hero-spot-x', `${spotX.toFixed(1)}%`);
        heroSection.style.setProperty('--hero-spot-y', `${spotY.toFixed(1)}%`);
      }

      if (ctx) {
        ctx.clearRect(0, 0, width, height);

        const pointerGlow = ctx.createRadialGradient(smoothX, smoothY, 10, smoothX, smoothY, 380);
        pointerGlow.addColorStop(0, 'rgba(245, 187, 103, 0.085)');
        pointerGlow.addColorStop(0.5, 'rgba(201, 128, 46, 0.03)');
        pointerGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = pointerGlow;
        ctx.fillRect(0, 0, width, height);

        const scrollOffset = window.scrollY * 0.15;

        for (let r = 0; r < silkRibbons.length; r++) {
          const rib = silkRibbons[r];
          const baseY = (height * rib.yRatio) - (scrollOffset % (height * 0.35));
          const phase = time * rib.speed + r * 1.7;

          const grad = ctx.createLinearGradient(0, baseY - rib.thickness, width, baseY + rib.thickness);
          grad.addColorStop(0, 'rgba(201, 128, 46, 0)');
          grad.addColorStop(0.25, `rgba(245, 187, 103, ${rib.alpha * 0.65})`);
          grad.addColorStop(0.5, `rgba(255, 244, 217, ${rib.alpha})`);
          grad.addColorStop(0.75, `rgba(201, 128, 46, ${rib.alpha * 0.65})`);
          grad.addColorStop(1, 'rgba(201, 128, 46, 0)');

          ctx.beginPath();
          const stepX = 28;

          for (let x = 0; x <= width + stepX; x += stepX) {
            const distToPointer = Math.hypot(x - smoothX, baseY - smoothY);
            const pointerPull = Math.max(0, 1 - distToPointer / 360) * ((smoothY - baseY) * 0.28);

            const waveY =
              baseY +
              Math.sin(x * rib.freq + phase) * rib.amp +
              Math.cos(x * rib.freq * 0.6 - phase * 1.3) * (rib.amp * 0.45) +
              pointerPull;

            if (x === 0) ctx.moveTo(x, waveY);
            else ctx.lineTo(x, waveY);
          }

          for (let x = width + stepX; x >= 0; x -= stepX) {
            const distToPointer = Math.hypot(x - smoothX, baseY - smoothY);
            const pointerPull = Math.max(0, 1 - distToPointer / 360) * ((smoothY - baseY) * 0.28);

            const lowerWaveY =
              baseY +
              rib.thickness * (0.55 + 0.35 * Math.sin(x * 0.003 + phase)) +
              Math.sin(x * rib.freq + phase + 0.9) * (rib.amp * 0.85) +
              pointerPull;

            ctx.lineTo(x, lowerWaveY);
          }

          ctx.closePath();
          ctx.fillStyle = grad;
          ctx.fill();

          ctx.beginPath();
          for (let x = 0; x <= width + stepX; x += stepX) {
            const distToPointer = Math.hypot(x - smoothX, baseY - smoothY);
            const pointerPull = Math.max(0, 1 - distToPointer / 360) * ((smoothY - baseY) * 0.28);
            const waveY =
              baseY +
              Math.sin(x * rib.freq + phase) * rib.amp +
              Math.cos(x * rib.freq * 0.6 - phase * 1.3) * (rib.amp * 0.45) +
              pointerPull;
            if (x === 0) ctx.moveTo(x, waveY);
            else ctx.lineTo(x, waveY);
          }
          ctx.strokeStyle = `rgba(255, 240, 205, ${rib.alpha * 1.35})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(renderLoop);
    }

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <div ref={progressRef} className="scroll-progress" id="scroll-progress" aria-hidden="true" />
      <canvas ref={canvasRef} id="silk-canvas" aria-hidden="true" />
    </>
  );
}
