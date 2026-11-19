import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface VisitorRecord {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  email: string;
  ticket_category: string;
  quantity: number;
  estimated_total: number;
  status: string; // 'pending' | 'confirmed' | 'cancelled'
  notes?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

// تحديد مسار مجلد وقاعدة البيانات المحلية
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'visitors.json');

function ensureDbFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

/**
 * جلب جميع الزوار والطلبات من قاعدة البيانات المحلية
 */
export function getLocalVisitors(): VisitorRecord[] {
  try {
    ensureDbFile();
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading local visitors database:', error);
    return [];
  }
}

/**
 * فحص ما إذا كان الزائر مسجلاً مسبقاً برقم الجوال أو البريد الإلكتروني
 */
export function findLocalVisitor(phone: string, email: string): VisitorRecord | null {
  const visitors = getLocalVisitors();
  const cleanPhone = phone.trim();
  const cleanEmail = email.trim().toLowerCase();

  const found = visitors.find(
    v => v.phone === cleanPhone || v.email.toLowerCase() === cleanEmail
  );

  return found || null;
}

/**
 * حفظ زائر جديد في قاعدة البيانات المحلية
 */
export function saveLocalVisitor(input: {
  fullName: string;
  phone: string;
  email: string;
  ticketCategory: string;
  quantity: number;
  estimatedTotal: number;
  notes?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): { record: VisitorRecord; isReturning: boolean } {
  ensureDbFile();

  const existing = findLocalVisitor(input.phone, input.email);
  const isReturning = Boolean(existing);

  const newRecord: VisitorRecord = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    full_name: input.fullName.trim(),
    phone: input.phone.trim(),
    email: input.email.trim().toLowerCase(),
    ticket_category: input.ticketCategory,
    quantity: input.quantity,
    estimated_total: input.estimatedTotal,
    status: 'pending',
    notes: input.notes || (isReturning ? `زائر مسجل سابقاً (ID: ${existing?.id})` : null),
    ip_address: input.ipAddress || 'local',
    user_agent: input.userAgent || ''
  };

  const visitors = getLocalVisitors();
  visitors.unshift(newRecord); // إضافة السجل في البداية

  // كتابة ذرية آمنة (Atomic Write)
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(visitors, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);

  return { record: newRecord, isReturning };
}

/**
 * تحديث حالة الطلب (pending, confirmed, cancelled)
 */
export function updateVisitorStatus(id: string, status: string): boolean {
  ensureDbFile();
  const visitors = getLocalVisitors();
  const index = visitors.findIndex(v => v.id === id);
  if (index === -1) return false;

  visitors[index].status = status;

  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(visitors, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
  return true;
}

/**
 * حذف طلب من قاعدة البيانات المحلية
 */
export function deleteVisitor(id: string): boolean {
  ensureDbFile();
  const visitors = getLocalVisitors();
  const filtered = visitors.filter(v => v.id !== id);
  if (filtered.length === visitors.length) return false;

  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(filtered, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
  return true;
}
