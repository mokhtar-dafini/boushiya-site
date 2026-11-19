import { NextRequest, NextResponse } from 'next/server';
import { getLocalVisitors, updateVisitorStatus, deleteVisitor } from '@/lib/localDb';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD || '1234';

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const queryPass = request.nextUrl.searchParams.get('key');
  return token === MANAGER_PASSWORD || queryPass === MANAGER_PASSWORD;
}

/**
 * تسجيل دخول المدير والتحقق من كلمة السر
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const password = String(body?.password || '').trim();

    if (password === MANAGER_PASSWORD) {
      return NextResponse.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        token: MANAGER_PASSWORD
      });
    }

    return NextResponse.json(
      { success: false, error: 'كلمة السر غير صحيحة، يرجى المحاولة مرة أخرى' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}

/**
 * جلب جميع الطلبات للمدير
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: 'غير مصرح بالدخول، يرجى إدخال كلمة السر أولاً' },
      { status: 401 }
    );
  }

  try {
    let orders: any[] = [];
    let source = 'local';

    if (isSupabaseConfigured) {
      const supabase = getServiceSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from('visitors')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          orders = data;
          source = 'supabase';
        }
      }
    }

    if (orders.length === 0) {
      orders = getLocalVisitors();
      source = 'local';
    }

    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.estimated_total) || 0), 0);
    const totalTickets = orders.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);
    const pendingCount = orders.filter(o => (o.status || 'pending') === 'pending').length;
    const confirmedCount = orders.filter(o => o.status === 'confirmed').length;

    return NextResponse.json({
      success: true,
      source,
      orders,
      stats: {
        totalOrders: orders.length,
        totalTickets,
        totalRevenue,
        pendingCount,
        confirmedCount
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'تعذر جلب الطلبات: ' + (error?.message || '') },
      { status: 500 }
    );
  }
}

/**
 * تحديث حالة الطلب
 */
export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'البيانات غير مكتملة' }, { status: 400 });
    }

    // تحديث في Supabase إذا كان متصلاً
    if (isSupabaseConfigured) {
      const supabase = getServiceSupabase();
      if (supabase) {
        await supabase.from('visitors').update({ status }).eq('id', id);
      }
    }

    // تحديث في قاعدة البيانات المحلية
    updateVisitorStatus(id, status);

    return NextResponse.json({ success: true, message: 'تم تحديث حالة الطلب بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

/**
 * حذف طلب
 */
export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'معرّف الطلب مطلوب' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const supabase = getServiceSupabase();
      if (supabase) {
        await supabase.from('visitors').delete().eq('id', id);
      }
    }

    deleteVisitor(id);

    return NextResponse.json({ success: true, message: 'تم حذف الطلب بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
