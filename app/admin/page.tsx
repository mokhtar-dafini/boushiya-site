'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Visitor {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  email: string;
  ticket_category: string;
  quantity: number;
  estimated_total: number;
  status: string;
  notes?: string | null;
}

export default function AdminPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dbMode, setDbMode] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const arabicFormatter = new Intl.NumberFormat('ar-SA');

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/visitors');
      const data = await res.json();
      setDbMode(data.databaseMode || 'Local Database');
      if (Array.isArray(data.latestVisitors)) {
        setVisitors(data.latestVisitors);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const filtered = visitors.filter(v => {
    const q = search.toLowerCase();
    return (
      v.full_name.toLowerCase().includes(q) ||
      v.phone.includes(q) ||
      v.email.toLowerCase().includes(q) ||
      v.ticket_category.includes(q)
    );
  });

  const totalRevenue = visitors.reduce((acc, v) => acc + (v.estimated_total || 0), 0);
  const totalTickets = visitors.reduce((acc, v) => acc + (v.quantity || 0), 0);

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', maxWidth: '1100px', margin: '0 auto', color: '#fffaf3' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#f5bb67', margin: '0 0 8px 0' }}>لوحة إدارة الحجوزات والزوار</h1>
          <p style={{ margin: 0, color: 'rgba(255, 245, 232, 0.75)', fontSize: '14px' }}>
            نوع قاعدة البيانات النشطة: <strong style={{ color: '#fff4d9' }}>{dbMode}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={fetchVisitors}
            className="primary-btn"
            style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '8px', cursor: 'pointer' }}
          >
            تحديث البيانات ⟳
          </button>
          <Link
            href="/"
            className="text-link glass-box spotlight-card"
            style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '8px', textDecoration: 'none' }}
          >
            العودة للموقع ←
          </Link>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="glass-box" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(20, 14, 10, 0.5)' }}>
          <span style={{ fontSize: '13px', color: '#c9802e' }}>إجمالي الزوار المسجلين</span>
          <h3 style={{ fontSize: '32px', margin: '8px 0 0 0', color: '#fffaf3' }}>{arabicFormatter.format(visitors.length)}</h3>
        </div>

        <div className="glass-box" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(20, 14, 10, 0.5)' }}>
          <span style={{ fontSize: '13px', color: '#c9802e' }}>إجمالي التذاكر المطلوبة</span>
          <h3 style={{ fontSize: '32px', margin: '8px 0 0 0', color: '#fffaf3' }}>{arabicFormatter.format(totalTickets)}</h3>
        </div>

        <div className="glass-box" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(20, 14, 10, 0.5)' }}>
          <span style={{ fontSize: '13px', color: '#c9802e' }}>الإجمالي التقديري للحجوزات</span>
          <h3 style={{ fontSize: '32px', margin: '8px 0 0 0', color: '#f5bb67' }}>
            {arabicFormatter.format(totalRevenue)} <small style={{ fontSize: '16px' }}>ر.س</small>
          </h3>
        </div>
      </div>

      {/* البحث */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="ابحث بالاسم، الجوال، البريد، أو الفئة..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 18px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 235, 205, 0.16)',
            background: 'rgba(20, 14, 10, 0.42)',
            color: '#fffaf3',
            fontSize: '15px',
            outline: 'none',
          }}
        />
      </div>

      {/* جدول الزوار */}
      <div className="glass-box" style={{ borderRadius: '16px', overflow: 'hidden', background: 'rgba(20, 14, 10, 0.5)' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#f5bb67' }}>جارٍ تحميل البيانات...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255, 245, 232, 0.6)' }}>
            لا توجد حجوزات مسجلة بعد.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 248, 238, 0.06)', borderBottom: '1px solid rgba(255, 235, 205, 0.16)' }}>
                  <th style={{ padding: '14px 16px', color: '#f5bb67' }}>الاسم الكامل</th>
                  <th style={{ padding: '14px 16px', color: '#f5bb67' }}>رقم الجوال</th>
                  <th style={{ padding: '14px 16px', color: '#f5bb67' }}>البريد الإلكتروني</th>
                  <th style={{ padding: '14px 16px', color: '#f5bb67' }}>فئة التذكرة</th>
                  <th style={{ padding: '14px 16px', color: '#f5bb67' }}>العدد</th>
                  <th style={{ padding: '14px 16px', color: '#f5bb67' }}>المبلغ</th>
                  <th style={{ padding: '14px 16px', color: '#f5bb67' }}>تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr
                    key={v.id}
                    style={{ borderBottom: '1px solid rgba(255, 235, 205, 0.08)' }}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>{v.full_name}</td>
                    <td style={{ padding: '14px 16px', direction: 'ltr', textAlign: 'right' }}>{v.phone}</td>
                    <td style={{ padding: '14px 16px', direction: 'ltr', textAlign: 'right' }}>{v.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        background: v.ticket_category === 'كبار الشخصيات' ? 'rgba(245, 187, 103, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                        color: v.ticket_category === 'كبار الشخصيات' ? '#f5bb67' : '#fffaf3',
                        border: '1px solid rgba(245, 187, 103, 0.3)'
                      }}>
                        {v.ticket_category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>{arabicFormatter.format(v.quantity)}</td>
                    <td style={{ padding: '14px 16px', color: '#f5bb67', fontWeight: 'bold' }}>
                      {arabicFormatter.format(v.estimated_total)} ر.س
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: 'rgba(255, 245, 232, 0.6)' }}>
                      {new Date(v.created_at).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
