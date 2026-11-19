'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
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
  ip_address?: string | null;
}

interface Stats {
  totalOrders: number;
  totalTickets: number;
  totalRevenue: number;
  pendingCount: number;
  confirmedCount: number;
}

export default function ManagerPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [source, setSource] = useState<string>('');
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const arabicFormatter = new Intl.NumberFormat('ar-SA');

  // استرجاع جلسة تسجيل الدخول المحفوظة
  useEffect(() => {
    const savedToken = localStorage.getItem('boushiya_manager_token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      fetchOrders(savedToken);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setToken(data.token);
        localStorage.setItem('boushiya_manager_token', data.token);
        fetchOrders(data.token);
      } else {
        setLoginError(data.error || 'كلمة المرور غير صحيحة');
      }
    } catch {
      setLoginError('تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('boushiya_manager_token');
    setToken('');
    setIsAuthenticated(false);
    setPasswordInput('');
    setOrders([]);
  };

  const fetchOrders = async (authToken: string) => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch('/api/manager', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOrders(data.orders || []);
        setStats(data.stats || null);
        setSource(data.source || 'local');
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/manager', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setOrders(prev =>
          prev.map(o => (o.id === id ? { ...o, status: newStatus } : o))
        );
        setActionMessage('تم تحديث حالة الطلب بنجاح');
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا الطلب نهائياً؟')) return;

    try {
      const res = await fetch(`/api/manager?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== id));
        setActionMessage('تم حذف الطلب بنجاح');
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // تصدير كملف CSV
  const exportToCSV = () => {
    if (orders.length === 0) return;

    const headers = ['المعرف', 'الاسم الكامل', 'الجوال', 'البريد', 'الفئة', 'العدد', 'المبلغ', 'الحالة', 'تاريخ الطلب', 'ملاحظات'];
    const rows = orders.map(o => [
      o.id,
      `"${o.full_name}"`,
      `"${o.phone}"`,
      `"${o.email}"`,
      `"${o.ticket_category}"`,
      o.quantity,
      o.estimated_total,
      o.status,
      `"${new Date(o.created_at).toLocaleString('ar-SA')}"`,
      `"${o.notes || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `طلبات_حفل_البوشية_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // تنظيف وتجهيز رقم الواتساب المباشر
  const getWhatsAppUrl = (phone: string, name: string) => {
    let clean = phone.replace(/[\s\-\(\)\.]/g, '');
    if (clean.startsWith('05')) {
      clean = '966' + clean.slice(1);
    } else if (clean.startsWith('5')) {
      clean = '966' + clean;
    } else if (clean.startsWith('+')) {
      clean = clean.slice(1);
    }
    const message = encodeURIComponent(`مرحبًا أختي ${name}، بخصوص طلب حجزكِ لحفل البوشية - هيبة الذهب.`);
    return `https://wa.me/${clean}?text=${message}`;
  };

  // فلترة الطلبات
  const filteredOrders = orders.filter(o => {
    const q = search.toLowerCase();
    const matchesSearch =
      o.full_name.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || (o.status || 'pending') === statusFilter;
    const matchesCategory = categoryFilter === 'all' || o.ticket_category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // ==========================================
  // شاشة تسجيل الدخول بكلمة السر (1234)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: '#070504',
        color: '#fffaf3',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div className="glass-box spotlight-card" style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px 32px',
          borderRadius: '24px',
          background: 'rgba(20, 14, 10, 0.7)',
          border: '1px solid rgba(245, 187, 103, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
          textAlign: 'center'
        }}>
          {/* الشعار والرمز */}
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 20px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(245, 187, 103, 0.2), rgba(201, 128, 46, 0.3))',
            border: '1px solid #f5bb67',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f5bb67'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', color: '#f5bb67' }}>
            بوابة دخول المدير
          </h2>
          <p style={{ margin: '0 0 28px 0', fontSize: '14px', color: 'rgba(255, 245, 232, 0.7)' }}>
            حفل البوشية - هيبة الذهب
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <label htmlFor="manager-pass" style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#ded0c0' }}>
                كلمة المرور
              </label>
              <input
                id="manager-pass"
                type="password"
                placeholder="أدخل كلمة السر (1234)"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                autoFocus
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 235, 205, 0.2)',
                  background: 'rgba(10, 7, 5, 0.8)',
                  color: '#fffaf3',
                  fontSize: '16px',
                  outline: 'none',
                  textAlign: 'center',
                  letterSpacing: '3px'
                }}
              />
            </div>

            {loginError && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(220, 38, 38, 0.2)',
                border: '1px solid rgba(220, 38, 38, 0.4)',
                color: '#fca5a5',
                fontSize: '13px'
              }}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="primary-btn"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '6px'
              }}
            >
              {isLoggingIn ? 'جارٍ التحقق...' : 'دخول إلى لوحة الطلبات'}
            </button>
          </form>

          <div style={{ marginTop: '24px', fontSize: '12px', color: 'rgba(255, 245, 232, 0.4)' }}>
            كلمة السر الافتراضية المحددة: <code style={{ color: '#f5bb67' }}>1234</code>
          </div>

          <div style={{ marginTop: '16px' }}>
            <Link href="/" style={{ color: 'rgba(245, 187, 103, 0.8)', fontSize: '13px', textDecoration: 'none' }}>
              ← العودة إلى الموقع الرئيسي
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // لوحة تحكم المدير بعد تسجيل الدخول
  // ==========================================
  return (
    <div style={{ minHeight: '100vh', background: '#070504', color: '#fffaf3', padding: '30px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* الشريط العلوي */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          paddingBottom: '24px',
          borderBottom: '1px solid rgba(255, 235, 205, 0.12)',
          marginBottom: '28px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '26px', margin: 0, color: '#f5bb67' }}>
                لوحة تحكم المدير — طلبات الحجز
              </h1>
              <span style={{
                fontSize: '11px',
                padding: '4px 8px',
                borderRadius: '12px',
                background: source === 'supabase' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 187, 103, 0.15)',
                color: source === 'supabase' ? '#4ade80' : '#f5bb67',
                border: '1px solid rgba(245, 187, 103, 0.3)'
              }}>
                {source === 'supabase' ? 'Supabase سحابية' : 'قاعدة محلية (data/visitors.json)'}
              </span>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'rgba(255, 245, 232, 0.7)' }}>
              إدارة وتأكيد حجوزات حفل البوشية والتواصل المباشر مع الزوار
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => fetchOrders(token)}
              className="text-link glass-box spotlight-card"
              style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', background: 'transparent' }}
            >
              تحديث البيانات ⟳
            </button>

            <button
              onClick={exportToCSV}
              className="text-link glass-box spotlight-card"
              style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', background: 'transparent' }}
            >
              تصدير Excel/CSV 📥
            </button>

            <Link
              href="/"
              target="_blank"
              className="text-link glass-box spotlight-card"
              style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '13px', textDecoration: 'none' }}
            >
              الموقع الرئيسي ↗
            </Link>

            <button
              onClick={handleLogout}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                background: 'rgba(220, 38, 38, 0.15)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                color: '#fca5a5',
                cursor: 'pointer'
              }}
            >
              تسجيل الخروج 🔒
            </button>
          </div>
        </div>

        {/* إشعار العمليات */}
        {actionMessage && (
          <div style={{
            padding: '12px 18px',
            marginBottom: '20px',
            borderRadius: '10px',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid #4ade80',
            color: '#4ade80',
            fontSize: '14px'
          }}>
            ✓ {actionMessage}
          </div>
        )}

        {/* كروت الإحصائيات الأربعة */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          <div className="glass-box" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(20, 14, 10, 0.6)' }}>
            <span style={{ fontSize: '13px', color: '#c9802e' }}>إجمالي الطلبات</span>
            <div style={{ fontSize: '30px', fontWeight: 'bold', marginTop: '6px', color: '#fffaf3' }}>
              {arabicFormatter.format(stats?.totalOrders || orders.length)}
            </div>
          </div>

          <div className="glass-box" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(20, 14, 10, 0.6)' }}>
            <span style={{ fontSize: '13px', color: '#c9802e' }}>إجمالي التذاكر</span>
            <div style={{ fontSize: '30px', fontWeight: 'bold', marginTop: '6px', color: '#fffaf3' }}>
              {arabicFormatter.format(stats?.totalTickets || 0)}
            </div>
          </div>

          <div className="glass-box" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(20, 14, 10, 0.6)' }}>
            <span style={{ fontSize: '13px', color: '#c9802e' }}>المبالغ التقديرية الإجمالية</span>
            <div style={{ fontSize: '30px', fontWeight: 'bold', marginTop: '6px', color: '#f5bb67' }}>
              {arabicFormatter.format(stats?.totalRevenue || 0)} <small style={{ fontSize: '15px' }}>ر.س</small>
            </div>
          </div>

          <div className="glass-box" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(20, 14, 10, 0.6)' }}>
            <span style={{ fontSize: '13px', color: '#c9802e' }}>بانتظار التواصل والتأكيد</span>
            <div style={{ fontSize: '30px', fontWeight: 'bold', marginTop: '6px', color: '#f59e0b' }}>
              {arabicFormatter.format(stats?.pendingCount || 0)}
            </div>
          </div>
        </div>

        {/* شريط البحث والفلترة */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* حقل البحث */}
          <div style={{ flex: '1 1 280px' }}>
            <input
              type="text"
              placeholder="ابحث بالاسم، الجوال، البريد، أو معرّف الطلب..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 235, 205, 0.16)',
                background: 'rgba(20, 14, 10, 0.5)',
                color: '#fffaf3',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* فلتر حالة الطلب */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'all', label: 'كافة الحالات' },
              { id: 'pending', label: 'بانتظار التأكيد' },
              { id: 'confirmed', label: 'مؤكدة' },
              { id: 'cancelled', label: 'ملغية' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  border: statusFilter === tab.id ? '1px solid #f5bb67' : '1px solid rgba(255, 235, 205, 0.1)',
                  background: statusFilter === tab.id ? 'rgba(245, 187, 103, 0.15)' : 'rgba(20, 14, 10, 0.4)',
                  color: statusFilter === tab.id ? '#f5bb67' : '#ded0c0',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* فلتر فئة التذكرة */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 235, 205, 0.16)',
              background: 'rgba(20, 14, 10, 0.5)',
              color: '#fffaf3',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">كافة الفئات</option>
            <option value="عادية">التذكرة العادية</option>
            <option value="مميزة">التذكرة المميزة</option>
            <option value="كبار الشخصيات">كبار الشخصيات</option>
          </select>
        </div>

        {/* جدول عرض الطلبات والبيانات */}
        <div className="glass-box" style={{ borderRadius: '18px', overflow: 'hidden', background: 'rgba(20, 14, 10, 0.6)' }}>
          {isLoadingOrders ? (
            <div style={{ padding: '50px', textAlign: 'center', color: '#f5bb67' }}>
              جارٍ تحميل الطلبات...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ padding: '50px', textAlign: 'center', color: 'rgba(255, 245, 232, 0.6)' }}>
              {orders.length === 0 ? 'لا توجد طلبات مسجلة بعد في قاعدة البيانات.' : 'لا توجد نتائج مطابقة لبحثك الحالي.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 248, 238, 0.05)', borderBottom: '1px solid rgba(255, 235, 205, 0.16)' }}>
                    <th style={{ padding: '14px 18px', color: '#f5bb67' }}>العميل / الزائر</th>
                    <th style={{ padding: '14px 18px', color: '#f5bb67' }}>معلومات التواصل</th>
                    <th style={{ padding: '14px 18px', color: '#f5bb67' }}>الباقة والكمية</th>
                    <th style={{ padding: '14px 18px', color: '#f5bb67' }}>الإجمالي</th>
                    <th style={{ padding: '14px 18px', color: '#f5bb67' }}>حالة الطلب</th>
                    <th style={{ padding: '14px 18px', color: '#f5bb67' }}>تاريخ الحجز</th>
                    <th style={{ padding: '14px 18px', color: '#f5bb67', textAlign: 'center' }}>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => {
                    const isPending = (order.status || 'pending') === 'pending';
                    const isConfirmed = order.status === 'confirmed';
                    const isCancelled = order.status === 'cancelled';

                    return (
                      <tr
                        key={order.id}
                        style={{ borderBottom: '1px solid rgba(255, 235, 205, 0.08)' }}
                      >
                        {/* الاسم ومعرف الطلب */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{order.full_name}</div>
                          {order.notes && (
                            <div style={{ fontSize: '11px', color: '#f5bb67', marginTop: '3px' }}>
                              ⭐ {order.notes}
                            </div>
                          )}
                          <div style={{ fontSize: '11px', color: 'rgba(255, 245, 232, 0.4)', marginTop: '2px', fontFamily: 'monospace' }}>
                            #{order.id.slice(0, 8)}
                          </div>
                        </td>

                        {/* التواصل: اتصال، واتساب، إيميل */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ direction: 'ltr', textAlign: 'right', fontWeight: '500' }}>
                            {order.phone}
                          </div>
                          <div style={{ fontSize: '12px', color: 'rgba(255, 245, 232, 0.65)', direction: 'ltr', textAlign: 'right' }}>
                            {order.email}
                          </div>

                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            <a
                              href={getWhatsAppUrl(order.phone, order.full_name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: 'rgba(34, 197, 94, 0.2)',
                                border: '1px solid rgba(34, 197, 94, 0.4)',
                                color: '#4ade80',
                                fontSize: '11px',
                                textDecoration: 'none'
                              }}
                            >
                              واتساب 💬
                            </a>

                            <a
                              href={`tel:${order.phone}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: 'rgba(245, 187, 103, 0.15)',
                                border: '1px solid rgba(245, 187, 103, 0.3)',
                                color: '#f5bb67',
                                fontSize: '11px',
                                textDecoration: 'none'
                              }}
                            >
                              اتصال 📞
                            </a>
                          </div>
                        </td>

                        {/* فئة التذكرة والعدد */}
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            background: order.ticket_category === 'كبار الشخصيات' ? 'rgba(245, 187, 103, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                            color: order.ticket_category === 'كبار الشخصيات' ? '#f5bb67' : '#fffaf3',
                            border: '1px solid rgba(245, 187, 103, 0.3)'
                          }}>
                            {order.ticket_category}
                          </span>
                          <div style={{ fontSize: '12px', color: 'rgba(255, 245, 232, 0.7)', marginTop: '4px' }}>
                            العدد: <strong>{arabicFormatter.format(order.quantity)}</strong> {order.quantity === 1 ? 'تذكرة' : 'تذاكر'}
                          </div>
                        </td>

                        {/* الإجمالي */}
                        <td style={{ padding: '14px 18px', fontWeight: 'bold', color: '#f5bb67', fontSize: '15px' }}>
                          {arabicFormatter.format(order.estimated_total)} <small style={{ fontSize: '12px' }}>ر.س</small>
                        </td>

                        {/* حالة الطلب */}
                        <td style={{ padding: '14px 18px' }}>
                          <select
                            value={order.status || 'pending'}
                            onChange={e => updateStatus(order.id, e.target.value)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              outline: 'none',
                              cursor: 'pointer',
                              border: isConfirmed
                                ? '1px solid rgba(34, 197, 94, 0.5)'
                                : isCancelled
                                ? '1px solid rgba(239, 68, 68, 0.5)'
                                : '1px solid rgba(245, 187, 103, 0.5)',
                              background: isConfirmed
                                ? 'rgba(34, 197, 94, 0.15)'
                                : isCancelled
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(245, 187, 103, 0.15)',
                              color: isConfirmed ? '#4ade80' : isCancelled ? '#f87171' : '#f5bb67'
                            }}
                          >
                            <option value="pending" style={{ background: '#140e0a', color: '#f5bb67' }}>بانتظار التأكيد</option>
                            <option value="confirmed" style={{ background: '#140e0a', color: '#4ade80' }}>مؤكد ✓</option>
                            <option value="cancelled" style={{ background: '#140e0a', color: '#f87171' }}>ملغي ✕</option>
                          </select>
                        </td>

                        {/* تاريخ ووقت الطلب */}
                        <td style={{ padding: '14px 18px', fontSize: '12px', color: 'rgba(255, 245, 232, 0.6)' }}>
                          <div>
                            {new Date(order.created_at).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div style={{ fontSize: '11px', marginTop: '2px' }}>
                            {new Date(order.created_at).toLocaleTimeString('ar-SA', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>

                        {/* حذف */}
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleDelete(order.id)}
                            title="حذف هذا الطلب"
                            style={{
                              padding: '6px 10px',
                              borderRadius: '8px',
                              background: 'transparent',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#f87171',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            حذف 🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
