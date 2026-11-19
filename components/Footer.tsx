import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <span>حفل البوشية هيبة الذهب 2026©</span>
        <span>ليلة سعودية نسائية تستحق حضوركِ</span>
        <Link
          href="/manager"
          style={{
            color: 'rgba(245, 187, 103, 0.7)',
            fontSize: '12px',
            textDecoration: 'none',
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid rgba(245, 187, 103, 0.2)',
            transition: 'all 0.2s ease'
          }}
        >
          بوابة المدير 🔒
        </Link>
      </div>
    </footer>
  );
}
