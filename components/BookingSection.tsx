'use client';

import React, { useState } from 'react';

interface TicketPackage {
  id: string;
  name: string;
  badge: string;
  description: string;
  price: number;
}

const PACKAGES: TicketPackage[] = [
  {
    id: 'عادية',
    name: 'التذكرة العادية',
    badge: 'دخول عام',
    description: 'دخول منطقة الحفل العامة • الضيافة السعودية الترحيبية',
    price: 150
  },
  {
    id: 'مميزة',
    name: 'التذكرة المميزة',
    badge: 'الأكثر طلباً',
    description: 'مقاعد أقرب إلى المسرح • أولوية الدخول والضيافة',
    price: 250
  },
  {
    id: 'كبار الشخصيات',
    name: 'كبار الشخصيات',
    badge: 'فخامة مطلقة',
    description: 'جناح VIP خاص • عشاء فاخر وخدمة ضيافة مباشرة',
    price: 400
  }
];

export default function BookingSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>('عادية');
  const [quantity, setQuantity] = useState<number>(1);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const [errors, setErrors] = useState<{ fullName?: boolean; email?: boolean; phone?: boolean }>({});
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const arabicFormatter = new Intl.NumberFormat('ar-SA');

  const currentPackage = PACKAGES.find(p => p.id === selectedCategory) || PACKAGES[0];
  const unitPrice = currentPackage.price;
  const totalPrice = unitPrice * quantity;

  const handleQuantityMinus = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleQuantityPlus = () => {
    setQuantity(prev => Math.min(10, prev + 1));
  };

  const validateForm = () => {
    const newErrors: { fullName?: boolean; email?: boolean; phone?: boolean } = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      newErrors.email = true;
    }

    const cleanPhoneDigits = phone.replace(/[\s\-\(\)\.]/g, '').replace(/^\+/, '');
    if (!phone.trim() || cleanPhoneDigits.length < 8 || cleanPhoneDigits.length > 15) {
      newErrors.phone = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!validateForm()) {
      setStatusMessage({
        text: 'يرجى التحقق من إكمال جميع بيانات التواصل بشكل صحيح (الاسم، الجوال، البريد) قبل إرسال الطلب.',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/visitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          ticketCategory: selectedCategory,
          quantity,
          estimatedTotal: totalPrice,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage({
          text: data.message || 'تم إرسال طلب حجزكِ وحفظ بياناتكِ بنجاح! سيتواصل معكِ فريق التنظيم لتأكيد التوفر.',
          type: 'success'
        });
        // تفريغ الحقول بعد الحفظ الناجح
        setFullName('');
        setEmail('');
        setPhone('');
        setQuantity(1);
        setErrors({});
      } else {
        setStatusMessage({
          text: data.error || 'لم يُرسل الطلب. يرجى المحاولة مرة أخرى.',
          type: 'error'
        });
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setStatusMessage({
        text: 'حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجددًا.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="booking" className="shell booking-section" aria-labelledby="booking-title">
      <div className="section-head reveal is-visible">
        <span className="section-tag">احجزي مقعدكِ</span>
        <h2 id="booking-title">باقات التذاكر والحجز</h2>
        <p className="section-lead">اختاري الباقة والعدد المطلوب، وسيتواصل معكِ المنظم لتأكيد الحجز.</p>
      </div>

      <form id="booking-form" className="booking-grid" onSubmit={handleSubmit} noValidate>
        {/* حاوية اختاري فئة التذكرة */}
        <div className="panel frosted-panel glass-box spotlight-card reveal is-visible">
          <h3 className="panel-title"><span className="step">١</span> اختاري فئة التذكرة</h3>

          <div className="package-grid" role="radiogroup" aria-label="باقات التذاكر">
            {PACKAGES.map(pkg => {
              const isSelected = selectedCategory === pkg.id;
              return (
                <label
                  key={pkg.id}
                  className={`package-card glass-box spotlight-card pop-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedCategory(pkg.id)}
                >
                  <input
                    type="radio"
                    name="category"
                    value={pkg.id}
                    checked={isSelected}
                    onChange={() => setSelectedCategory(pkg.id)}
                  />
                  <div>
                    <div className="pkg-top">
                      <span className="pkg-badge">{pkg.badge}</span>
                      <span className="pkg-check" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </span>
                    </div>
                    <h4 className="pkg-name">{pkg.name}</h4>
                    <p className="pkg-desc">{pkg.description}</p>
                  </div>
                  <div className="pkg-price-box">
                    <span className="pkg-price-label">السعر</span>
                    <span className="pkg-price">{arabicFormatter.format(pkg.price)} <small>ر.س</small></span>
                  </div>
                </label>
              );
            })}
          </div>

          {/* عدد التذاكر */}
          <div className="field-block">
            <div className="field-block-info">
              <span className="field-label" id="quantity-label">عدد التذاكر</span>
              <p className="hint">من تذكرة واحدة إلى ١٠ تذاكر</p>
            </div>
            <div className="quantity-control" role="group" aria-labelledby="quantity-label">
              <button
                id="quantity-minus"
                type="button"
                aria-label="تقليل عدد التذاكر"
                onClick={handleQuantityMinus}
              >
                −
              </button>
              <output id="quantity-value" aria-live="polite">
                {arabicFormatter.format(quantity)}
              </output>
              <button
                id="quantity-plus"
                type="button"
                aria-label="زيادة عدد التذاكر"
                onClick={handleQuantityPlus}
              >
                +
              </button>
            </div>
          </div>

          <div className="form-divider"></div>

          {/* بيانات التواصل */}
          <h3 className="panel-title"><span className="step">٢</span> بيانات التواصل</h3>

          <div className="fields">
            <div className="field full">
              <label htmlFor="full-name">الاسم الكامل</label>
              <input
                id="full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="اكتبي اسمكِ الكامل"
                className={errors.fullName ? 'input-error' : ''}
                value={fullName}
                onChange={e => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors(prev => ({ ...prev, fullName: false }));
                }}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="email">البريد الإلكتروني</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="example@email.com"
                dir="ltr"
                className={errors.email ? 'input-error' : ''}
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: false }));
                }}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="phone">رقم الجوال</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="05xxxxxxxx"
                className={errors.phone ? 'input-error' : ''}
                value={phone}
                onChange={e => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: false }));
                }}
                required
              />
            </div>
          </div>
        </div>

        {/* حاوية ملخص الطلب */}
        <aside className="panel frosted-panel summary glass-box spotlight-card pop-card reveal is-visible" aria-labelledby="summary-title">
          <div className="summary-top">
            <h3 id="summary-title" className="panel-title">ملخص الطلب</h3>
            <span className="summary-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9 12 2 2 4-4"/></svg>
            </span>
          </div>

          <div className="summary-event">
            <strong className="summary-event-title">حفل البوشية - هيبة الذهب</strong>
            <span className="summary-event-sub">حفل سعودي نسائي • أزياء تراثية • ضيافة وعشاء</span>
          </div>

          <div className="summary-details-box">
            <div className="summary-row">
              <span>الفئة المختارة</span>
              <strong id="summary-category">{currentPackage.id}</strong>
            </div>

            <div className="summary-row">
              <span>سعر التذكرة التقديري</span>
              <strong id="summary-unit">{arabicFormatter.format(unitPrice)} ر.س</strong>
            </div>

            <div className="summary-row">
              <span>الكمية</span>
              <strong id="summary-quantity">{arabicFormatter.format(quantity)}</strong>
            </div>
          </div>

          <hr className="summary-rule" />

          <div className="total-row">
            <span>الإجمالي التقديري</span>
            <span id="summary-total">{arabicFormatter.format(totalPrice)} <small>ر.س</small></span>
          </div>

          <button id="submit-button" type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <span>جارٍ إرسال الطلب وحفظ البيانات...</span>
            ) : (
              <>
                <span>إرسال طلب الحجز</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              </>
            )}
          </button>

          <p className="disclaimer">
            هذا طلب حجز أولي وليس عملية دفع مباشرة؛ سيتم حفظ بياناتكِ ويتواصل معكِ المنظم لتأكيد التوفر والتفاصيل.
          </p>

          {statusMessage && (
            <div id="form-status" className={`status ${statusMessage.type}`} role="status" aria-live="polite">
              {statusMessage.text}
            </div>
          )}
        </aside>
      </form>
    </section>
  );
}
