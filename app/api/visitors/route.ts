import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { validateVisitorInput } from '@/lib/validation';
import { saveLocalVisitor, findLocalVisitor, getLocalVisitors } from '@/lib/localDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isSupabase = isSupabaseConfigured;
  const localList = getLocalVisitors();

  return NextResponse.json({
    status: 'ok',
    service: 'Boushiya Booking API',
    databaseMode: isSupabase ? 'Supabase (Cloud)' : 'Local Database (data/visitors.json)',
    totalVisitors: isSupabase ? 'Managed on Supabase' : localList.length,
    message: isSupabase
      ? 'متصل بقاعدة بيانات Supabase السحابية'
      : 'يعمل بقاعدة البيانات المحلية (data/visitors.json) - يتم حفظ وفحص كافة الزوار محلياً',
    latestVisitors: isSupabase ? [] : localList.slice(0, 10)
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { success: false, error: 'بيانات الطلب غير صالحة' },
        { status: 400 }
      );
    }

    // 1. التحقق من صحة بيانات الزائر (الاسم، الجوال، البريد)
    const validation = validateVisitorInput(body);
    if (!validation.valid || !validation.cleanedData) {
      const firstError = Object.values(validation.errors)[0] || 'يرجى التأكد من صحة البيانات';
      return NextResponse.json(
        {
          success: false,
          error: firstError,
          errors: validation.errors
        },
        { status: 422 }
      );
    }

    const { fullName, phone, email, ticketCategory, quantity, estimatedTotal } = validation.cleanedData;
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'local';

    // 2. إذا كانت قاعدة بيانات Supabase مهيأة، نستخدمها:
    if (isSupabaseConfigured) {
      const supabase = getServiceSupabase();
      if (supabase) {
        let isReturningVisitor = false;
        let existingVisitorId: string | null = null;

        try {
          const { data: existing } = await supabase
            .from('visitors')
            .select('id, full_name, phone, email, created_at')
            .or(`phone.eq.${phone},email.eq.${email}`)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (existing) {
            isReturningVisitor = true;
            existingVisitorId = existing.id;
          }
        } catch (checkErr) {
          console.warn('Visitor lookup warning:', checkErr);
        }

        const insertPayload = {
          full_name: fullName,
          phone,
          email,
          ticket_category: ticketCategory,
          quantity,
          estimated_total: estimatedTotal,
          status: 'pending',
          notes: isReturningVisitor ? `طلب حجز جديد لزائر مسجل سابقاً (ID: ${existingVisitorId})` : null,
          user_agent: userAgent.slice(0, 255),
          ip_address: ip.slice(0, 45)
        };

        const { data: savedRecord, error: insertError } = await supabase
          .from('visitors')
          .insert([insertPayload])
          .select()
          .single();

        if (!insertError && savedRecord) {
          const message = isReturningVisitor
            ? `أهلاً بكِ مجدداً يا ${fullName}! تم تسجيل طلب حجزكِ الجديد بنجاح في قاعدة البيانات.`
            : `تم استلام طلب حجزكِ وحفظ بياناتكِ بنجاح يا ${fullName}! سيتواصل معكِ فريق التنظيم.`;

          return NextResponse.json(
            {
              success: true,
              message,
              isReturningVisitor,
              database: 'supabase',
              visitor: {
                id: savedRecord.id,
                fullName: savedRecord.full_name,
                phone: savedRecord.phone,
                email: savedRecord.email,
                ticketCategory: savedRecord.ticket_category,
                quantity: savedRecord.quantity,
                estimatedTotal: savedRecord.estimated_total,
                createdAt: savedRecord.created_at
              }
            },
            { status: 201 }
          );
        }
      }
    }

    // 3. قاعدة البيانات المحلية (Local Database)
    // حفظ وفحص الزائر محلياً في ملف data/visitors.json
    const { record, isReturning } = saveLocalVisitor({
      fullName,
      phone,
      email,
      ticketCategory,
      quantity,
      estimatedTotal,
      ipAddress: ip,
      userAgent: userAgent.slice(0, 255)
    });

    const message = isReturning
      ? `أهلاً بكِ مجدداً يا ${fullName}! تم تسجيل طلب حجزكِ الجديد وحفظه في قاعدة البيانات المحلية بنجاح.`
      : `تم استلام طلب حجزكِ وحفظ بياناتكِ بنجاح يا ${fullName}! تم تسجيل الاسم والجوال والإيميل في قاعدة البيانات.`;

    return NextResponse.json(
      {
        success: true,
        message,
        isReturningVisitor: isReturning,
        database: 'local (data/visitors.json)',
        visitor: {
          id: record.id,
          fullName: record.full_name,
          phone: record.phone,
          email: record.email,
          ticketCategory: record.ticket_category,
          quantity: record.quantity,
          estimatedTotal: record.estimated_total,
          createdAt: record.created_at
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ غير متوقع أثناء معالجة الطلب: ' + (error?.message || '')
      },
      { status: 500 }
    );
  }
}
