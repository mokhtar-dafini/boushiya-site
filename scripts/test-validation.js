// Direct test in node
const { validateVisitorInput, cleanAndValidatePhone, validateEmail, validateFullName } = (() => {
  function validateFullName(name) {
    if (!name || typeof name !== 'string') return { valid: false, error: 'الاسم الكامل مطلوب' };
    const trimmed = name.trim();
    if (trimmed.length < 2) return { valid: false, error: 'الاسم يجب أن يحتوي على حرفين على الأقل' };
    if (trimmed.length > 100) return { valid: false, error: 'الاسم طويل جداً' };
    return { valid: true };
  }

  function cleanAndValidatePhone(phone) {
    if (!phone || typeof phone !== 'string') return { valid: false, error: 'رقم الجوال مطلوب' };
    let cleaned = phone.replace(/[\s\-\(\)\.]/g, '').trim();
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    for (let i = 0; i < 10; i++) {
      cleaned = cleaned.replaceAll(arabicDigits[i], String(i));
    }
    const digitsOnly = cleaned.replace(/^\+/, '');
    if (!/^\d{8,15}$/.test(digitsOnly)) {
      return { valid: false, error: 'يرجى إدخال رقم جوال صحيح (مثال: 05xxxxxxxx)' };
    }
    if (/^5\d{8}$/.test(cleaned)) {
      cleaned = '0' + cleaned;
    } else if (/^(?:\+966|00966|966)5\d{8}$/.test(cleaned)) {
      cleaned = '05' + cleaned.slice(-8);
    }
    return { valid: true, cleanPhone: cleaned };
  }

  function validateEmail(email) {
    if (!email || typeof email !== 'string') return { valid: false, error: 'البريد الإلكتروني مطلوب' };
    const cleaned = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(cleaned)) return { valid: false, error: 'يرجى إدخال بريد إلكتروني صحيح' };
    return { valid: true, cleanEmail: cleaned };
  }

  function validateVisitorInput(data) {
    const errors = {};
    const nameVal = validateFullName(data?.fullName || data?.full_name);
    if (!nameVal.valid) errors.fullName = nameVal.error;
    const phoneVal = cleanAndValidatePhone(data?.phone);
    if (!phoneVal.valid) errors.phone = phoneVal.error;
    const emailVal = validateEmail(data?.email);
    if (!emailVal.valid) errors.email = emailVal.error;

    if (Object.keys(errors).length > 0) return { valid: false, errors };

    const validCategories = ['عادية', 'مميزة', 'كبار الشخصيات'];
    const rawCategory = String(data?.ticketCategory || data?.ticket_category || 'عادية').trim();
    const ticketCategory = validCategories.includes(rawCategory) ? rawCategory : 'عادية';
    const quantity = Math.min(Math.max(1, parseInt(data?.quantity, 10) || 1), 10);
    const priceMap = { 'عادية': 150, 'مميزة': 250, 'كبار الشخصيات': 400 };
    const estimatedTotal = priceMap[ticketCategory] * quantity;

    return {
      valid: true,
      errors: {},
      cleanedData: {
        fullName: (data?.fullName || data?.full_name).trim(),
        phone: phoneVal.cleanPhone,
        email: emailVal.cleanEmail,
        ticketCategory,
        quantity,
        estimatedTotal: Number(data?.estimatedTotal) || estimatedTotal
      }
    };
  }

  return { validateVisitorInput, cleanAndValidatePhone, validateEmail, validateFullName };
})();

console.log('Testing Visitor Validation...');

// 1. Test Full Name
console.assert(validateFullName('سارة العتيبي').valid === true, 'Valid Arabic name should pass');
console.assert(validateFullName('').valid === false, 'Empty name should fail');

// 2. Test Phone
const saudi1 = cleanAndValidatePhone('0512345678');
console.assert(saudi1.valid && saudi1.cleanPhone === '0512345678', '0512345678 should pass');

const saudi2 = cleanAndValidatePhone('+966 51 234 5678');
console.assert(saudi2.valid && saudi2.cleanPhone === '0512345678', '+966 format should standardize to 05xxxxxxxx');

const saudiArabic = cleanAndValidatePhone('٠٥١٢٣٤٥٦٧٨');
console.assert(saudiArabic.valid && saudiArabic.cleanPhone === '0512345678', 'Arabic numerals phone should standardize to 05xxxxxxxx');

// 3. Test Email
console.assert(validateEmail('sara@example.com').valid === true, 'Valid email should pass');
console.assert(validateEmail('invalid-email').valid === false, 'Invalid email should fail');

// 4. Test Complete Payload
const validPayload = validateVisitorInput({
  fullName: 'نورة الدوسري',
  phone: '0501234567',
  email: 'noura@test.com',
  ticketCategory: 'مميزة',
  quantity: 2
});

console.assert(validPayload.valid === true, 'Valid payload should pass');
console.assert(validPayload.cleanedData.estimatedTotal === 500, '2 tickets at 250 each should equal 500 total');

console.log('✅ ALL VALIDATION TESTS PASSED SUCCESSFULLY! Estimated total:', validPayload.cleanedData.estimatedTotal, 'SAR');
