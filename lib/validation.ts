export interface VisitorInput {
  fullName: string;
  phone: string;
  email: string;
  ticketCategory?: string;
  quantity?: number;
  estimatedTotal?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: {
    fullName?: string;
    phone?: string;
    email?: string;
  };
  cleanedData?: {
    fullName: string;
    phone: string;
    email: string;
    ticketCategory: string;
    quantity: number;
    estimatedTotal: number;
  };
}

/**
 * Validates full name: minimum 2 characters, no empty string
 */
export function validateFullName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'الاسم الكامل مطلوب' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { valid: false, error: 'الاسم يجب أن يحتوي على حرفين على الأقل' };
  }
  if (trimmed.length > 100) {
    return { valid: false, error: 'الاسم طويل جداً' };
  }
  return { valid: true };
}

/**
 * Cleans and validates phone number (Saudi and international format)
 */
export function cleanAndValidatePhone(phone: string): { valid: boolean; cleanPhone?: string; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'رقم الجوال مطلوب' };
  }

  // Remove whitespace, dashes, parens, dots
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '').trim();

  // Convert Arabic/Eastern numbers to Western digits
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  for (let i = 0; i < 10; i++) {
    cleaned = cleaned.replaceAll(arabicDigits[i], String(i));
  }

  // Check valid phone format:
  // Saudi numbers usually: 05xxxxxxxx, +9665xxxxxxxx, 009665xxxxxxxx, 9665xxxxxxxx, or 5xxxxxxxx
  // International: +[1-9][0-9]{7,14}
  const digitsOnly = cleaned.replace(/^\+/, '');
  if (!/^\d{8,15}$/.test(digitsOnly)) {
    return {
      valid: false,
      error: 'يرجى إدخال رقم جوال صحيح (مثال: 05xxxxxxxx)'
    };
  }

  // Standardize Saudi numbers to 05xxxxxxxx if 9 digits starting with 5
  if (/^5\d{8}$/.test(cleaned)) {
    cleaned = '0' + cleaned;
  } else if (/^(?:\+966|00966|966)5\d{8}$/.test(cleaned)) {
    cleaned = '05' + cleaned.slice(-8);
  }

  return { valid: true, cleanPhone: cleaned };
}

/**
 * Validates email format
 */
export function validateEmail(email: string): { valid: boolean; cleanEmail?: string; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'البريد الإلكتروني مطلوب' };
  }

  const cleaned = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(cleaned)) {
    return { valid: false, error: 'يرجى إدخال بريد إلكتروني صحيح (مثال: name@example.com)' };
  }

  return { valid: true, cleanEmail: cleaned };
}

/**
 * Validates entire visitor input payload
 */
export function validateVisitorInput(data: any): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  const nameVal = validateFullName(data?.fullName || data?.full_name);
  if (!nameVal.valid) errors.fullName = nameVal.error;

  const phoneVal = cleanAndValidatePhone(data?.phone);
  if (!phoneVal.valid) errors.phone = phoneVal.error;

  const emailVal = validateEmail(data?.email);
  if (!emailVal.valid) errors.email = emailVal.error;

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  const validCategories = ['عادية', 'مميزة', 'كبار الشخصيات'];
  const rawCategory = String(data?.ticketCategory || data?.ticket_category || 'عادية').trim();
  const ticketCategory = validCategories.includes(rawCategory) ? rawCategory : 'عادية';

  const quantity = Math.min(Math.max(1, parseInt(data?.quantity, 10) || 1), 10);
  
  const priceMap: Record<string, number> = {
    'عادية': 150,
    'مميزة': 250,
    'كبار الشخصيات': 400
  };
  const estimatedTotal = priceMap[ticketCategory] * quantity;

  return {
    valid: true,
    errors: {},
    cleanedData: {
      fullName: (data?.fullName || data?.full_name).trim(),
      phone: phoneVal.cleanPhone!,
      email: emailVal.cleanEmail!,
      ticketCategory,
      quantity,
      estimatedTotal: Number(data?.estimatedTotal) || estimatedTotal
    }
  };
}
