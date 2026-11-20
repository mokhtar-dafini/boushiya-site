'use client';

import React, { useRef, useState, useEffect } from 'react';

interface AudioPlayerProps {
  onPlayingChange?: (playing: boolean) => void;
}

export default function AudioPlayer({ onPlayingChange }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeText, setTimeText] = useState('0:00');
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hasProgress, setHasProgress] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const filePickerRef = useRef<HTMLInputElement | null>(null);
  const orbBtnRef = useRef<HTMLButtonElement | null>(null);
  const ringProgressRef = useRef<SVGCircleElement | null>(null);
  const ringThumbRef = useRef<SVGCircleElement | null>(null);
  const ringHitRef = useRef<SVGCircleElement | null>(null);
  const justScrubbedRef = useRef(false);

  const radius = 42;
  const center = 46;
  const circumference = 2 * Math.PI * radius; // 263.89

  function formatTime(sec: number) {
    if (!Number.isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function setCircleProgress(ratio: number) {
    const clamped = Math.max(0, Math.min(1, ratio));
    const offset = circumference - clamped * circumference;
    if (ringProgressRef.current) {
      ringProgressRef.current.style.strokeDashoffset = offset.toFixed(2);
    }
    const angleRad = clamped * 2 * Math.PI;
    const tx = center + radius * Math.cos(angleRad);
    const ty = center + radius * Math.sin(angleRad);
    if (ringThumbRef.current) {
      ringThumbRef.current.setAttribute('cx', tx.toFixed(2));
      ringThumbRef.current.setAttribute('cy', ty.toFixed(2));
    }
  }

  function getRatioFromPointer(clientX: number, clientY: number) {
    if (!orbBtnRef.current) return 0;
    const rect = orbBtnRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;

    let angle = Math.atan2(dx, -dy);
    if (angle < 0) angle += 2 * Math.PI;
    return angle / (2 * Math.PI);
  }

  function applyScrub(clientX: number, clientY: number, commitAudio: boolean) {
    const scrubRatio = getRatioFromPointer(clientX, clientY);
    setCircleProgress(scrubRatio);
    setHasProgress(true);

    const audio = audioRef.current;
    if (audio && Number.isFinite(audio.duration) && audio.duration > 0) {
      const targetTime = scrubRatio * audio.duration;
      setTimeText(`${formatTime(targetTime)} / ${formatTime(audio.duration)}`);
      if (commitAudio) {
        audio.currentTime = targetTime;
      }
    }
  }

  const togglePlay = async () => {
    if (justScrubbedRef.current || isScrubbing) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (!isPlaying) {
      try {
        if (!audio.src || audio.src === '' || audio.src.endsWith('/')) {
          audio.src = '/song.mp4';
        }
        await audio.play();
        setIsPlaying(true);
        onPlayingChange?.(true);
      } catch (err) {
        // Fallback to manual file picker if browser blocks autoplay or format
        filePickerRef.current?.click();
      }
    } else {
      audio.pause();
      setIsPlaying(false);
      onPlayingChange?.(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !audioRef.current) return;
    const objectUrl = URL.createObjectURL(file);
    audioRef.current.src = objectUrl;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
      onPlayingChange?.(true);
    } catch {
      setIsPlaying(false);
      onPlayingChange?.(false);
    }
  };

  useEffect(() => {
    const ringHit = ringHitRef.current;
    if (!ringHit) return;

    const handlePointerDown = (e: PointerEvent) => {
      e.stopPropagation();
      setIsScrubbing(true);
      justScrubbedRef.current = true;
      if (ringHit.setPointerCapture) {
        try { ringHit.setPointerCapture(e.pointerId); } catch (_) {}
      }
      applyScrub(e.clientX, e.clientY, true);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isScrubbing) return;
      applyScrub(e.clientX, e.clientY, true);
    };

    const handlePointerEnd = (e: PointerEvent) => {
      if (!isScrubbing) return;
      applyScrub(e.clientX, e.clientY, true);
      setIsScrubbing(false);
      setTimeout(() => { justScrubbedRef.current = false; }, 120);
    };

    ringHit.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerEnd, { passive: true });
    window.addEventListener('pointercancel', handlePointerEnd, { passive: true });

    return () => {
      ringHit.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
    };
  }, [isScrubbing]);

  const onTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || isScrubbing) return;
    if (audio.duration) {
      const ratio = audio.currentTime / audio.duration;
      setCircleProgress(ratio);
      if (audio.currentTime > 0) setHasProgress(true);
      setTimeText(`${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`);
    }
  };

  const onLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio?.duration) {
      setTimeText(`0:00 / ${formatTime(audio.duration)}`);
    }
  };

  // حلقة تكرار دائمة (Loop) حتى يوقفها الزائر بنفسه
  const onEnded = () => {
    const audio = audioRef.current;
    if (audio && isPlaying) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  return (
    <section className="shell music-orb-section reveal is-visible" aria-label="مشغل أغنية حفل البوشية">
      <div
        className={`music-orb-wrapper ${isPlaying ? 'is-playing' : ''} ${isScrubbing ? 'is-scrubbing' : ''} ${hasProgress ? 'has-progress' : ''}`}
        id="music-orb-wrapper"
      >
        <div className="music-orb-stage" id="music-orb-stage">
          <span className="orb-ripple orb-ripple-1" aria-hidden="true"></span>
          <span className="orb-ripple orb-ripple-2" aria-hidden="true"></span>

          <button
            ref={orbBtnRef}
            type="button"
            id="music-orb-btn"
            className="music-orb-btn spotlight-card"
            aria-label="تشغيل أو إيقاف أغنية حفل البوشية"
            aria-pressed={isPlaying}
            onClick={togglePlay}
          >
            <svg className="orb-ring-svg" id="orb-ring-svg" viewBox="0 0 92 92" aria-hidden="true">
              <defs>
                <linearGradient id="goldRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fff4d9" />
                  <stop offset="50%" stopColor="#f5bb67" />
                  <stop offset="100%" stopColor="#c9802e" />
                </linearGradient>
              </defs>
              <circle className="orb-ring-track" cx="46" cy="46" r="42"></circle>
              <circle ref={ringProgressRef} className="orb-ring-progress" id="orb-ring-progress" cx="46" cy="46" r="42"></circle>
              <circle ref={ringThumbRef} className="orb-ring-thumb" id="orb-ring-thumb" cx="88" cy="46" r="4.2"></circle>
              <circle ref={ringHitRef} className="orb-ring-hit" id="orb-ring-hit" cx="46" cy="46" r="42"></circle>
            </svg>

            <div className="orb-center-content">
              <svg className="orb-icon-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5.14v13.72a1 1 0 0 0 1.55.83l10.8-6.86a1 1 0 0 0 0-1.66L9.55 4.31A1 1 0 0 0 8 5.14Z"/>
              </svg>
              <svg className="orb-icon-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6.5" y="5" width="3.8" height="14" rx="1.4"/>
                <rect x="13.7" y="5" width="3.8" height="14" rx="1.4"/>
              </svg>
              <div className="orb-equalizer" aria-hidden="true">
                <span className="orb-bar"></span>
                <span className="orb-bar"></span>
                <span className="orb-bar"></span>
                <span className="orb-bar"></span>
              </div>
            </div>
          </button>
        </div>

        <div className="music-orb-caption">
          <span className="music-status-dot" aria-hidden="true"></span>
          <span id="music-orb-label">{isPlaying ? 'أغنيـة البُوشيــة (جارٍ التشغيل والتكرار)' : 'استمعي إلى أغنيـة البُوشيـة'}</span>
          <span className="music-time-badge" id="music-time-badge" dir="ltr">{timeText}</span>
        </div>

        <audio
          ref={audioRef}
          id="evening-audio"
          src="/song.mp4"
          preload="auto"
          loop
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={onEnded}
          onPlay={() => { setIsPlaying(true); onPlayingChange?.(true); }}
          onPause={() => { setIsPlaying(false); onPlayingChange?.(false); }}
        >
          <source src="/song.mp4" type="audio/mp4" />
          <source src="/song.mp4" type="video/mp4" />
          <source src="/song.mp3" type="audio/mpeg" />
          <source src="/أغنية البوشية.m4a" type="audio/mp4" />
          <source src="/boushiya.mp3" type="audio/mpeg" />
        </audio>
        <input ref={filePickerRef} type="file" id="audio-file-picker" accept="audio/*,video/*" hidden onChange={handleFileChange} />
      </div>
    </section>
  );
}
