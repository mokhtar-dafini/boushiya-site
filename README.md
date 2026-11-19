# موقع حفل البوشية - هيبة الذهب (Next.js + Supabase + Vercel)

موقع متكامل (Frontend + Backend API) مبني باستخدام **Next.js 14 (App Router)** وقاعدة بيانات **Supabase** ومُهيأ بالكامل للرفع المباشر على **Vercel**، ومستند إلى تصميم `newsite.html` الفاخر.

---

## 🌟 المميزات والمكونات المنفذة

1. **الواجهة الأمامية (Frontend):**
   - تصميم فاخر متكامل بهوية الأوبسيديان والذهب والزجاج فائق الشفافية والضبابية (Ultra Frosted Glass).
   - دعم كامل للغة العربية واتجاه اليمين لليسار (`dir="rtl"`).
   - خلفية تفاعلية متحركة لا تتوقف لقماش الحرير الذهبي (`SilkCanvas`) تتفاعل مع حركة الماوس واللمس وإيقاع الموسيقى.
   - تأثيرات إضاءة تفاعلية وبطاقات ثلاثية الأبعاد (Parallax Spotlight Cards).
   - مشغل تفاعلي دائري لأغنية البوشية مع شريط تحكم دائري (Circular Scrubber) وموجات صوتية.
   - محدد فئات التذاكر (عادية 150 ر.س، مميزة 250 ر.س، كبار الشخصيات 400 ر.س) مع عداد التذاكر وحساب الإجمالي فورياً بالأرقام العربية.

2. **الخلفية والتحقق وقاعدة البيانات (Backend & Supabase):**
   - **التحقق (Validation):** فحص وتدقيق دقيق لاسم الزائر ورقم الجوال (تحويل الأرقام العربية، التحقق من صيغة الجوال السعودي والدولي 05xxxxxxxx) والبريد الإلكتروني.
   - **فحص الزائر (Visitor Check):** الاستعلام من قاعدة البيانات للتأكد مما إذا كان الزائر مسجلاً مسبقاً برقم الجوال أو البريد الإلكتروني.
   - **حفظ البيانات (Database Save):** حفظ سجل الزائر وتفاصيل تذكرته في جدول `visitors` في Supabase مع التوقيت وحالة الطلب.
   - مسار API خادم متوافق مع Vercel Serverless: `/api/visitors` و `/api/bookings`.

---

## 🗄️ الخطوة 1: إعداد قاعدة بيانات Supabase

1. أنشئ مشروعاً جديداً مجانياً على [Supabase](https://supabase.com).
2. ادخل إلى لوحة تحكم مشروعك وافتح **SQL Editor** من القائمة الجانبية.
3. افتح ملف `supabase-schema.sql` الموجود في هذا المجلد، وانسخ محتواه بالكامل والصقه في SQL Editor ثم اضغط **Run**.
4. سيتم إنشاء جدول `visitors` مع الفهارس اللازمة وسياسات الأمان (Row Level Security - RLS).

---

## 🔑 الخطوة 2: إعداد مفاتيح الاتصال (.env.local)

من لوحة تحكم Supabase، اذهب إلى:
`Project Settings` ⬅️ `API`

انسخ القيم وضعها في ملف `.env.local` في مجلد المشروع:

```env
# رابط مشروعك
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co

# المفتاح العام (Anon Key)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# المفتاح السري للخادم (Service Role Key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

---

## 💻 التشغيل المحلي

```bash
# تثبيت الحزم (تم مسبقاً)
npm install

# تشغيل بيئة التطوير
npm run dev
```

افتح المتصفح على: `http://localhost:3000`

---

## 🚀 الخطوة 3: الرفع والنشر على Vercel (Deployment)

### الطريقة الأولى: عبر GitHub و Vercel Dashboard (الأسهل والأفضل)
1. ارفع المشروع إلى حسابك في **GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit: Next.js + Supabase site"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
2. ادخل على [Vercel.com](https://vercel.com) واضغط **Add New** ثم **Project**.
3. اختر مستودع المشروع واضغط **Import**.
4. في قسم **Environment Variables** أضف المتغيرات الثلاثة:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. اضغط **Deploy**! سيبدأ الموقع بالعمل فوراً مع رابط مباشر سريع ومحمي بشهادة SSL تلقائية.

---

## 📁 هيكل المشروع

```text
├── app/
│   ├── api/
│   │   ├── visitors/route.ts  # معالج فحص وحفظ بيانات الزوار
│   │   └── bookings/route.ts  # مسار بديل للحجوزات
│   ├── globals.css            # التصميم الكامل المأخوذ من newsite.html
│   ├── layout.tsx             # التخطيط العام ودعم اللغة العربية
│   └── page.tsx               # الصفحة الرئيسية
├── components/
│   ├── AboutSection.tsx       # قسم نبذة عن الأمسية
│   ├── AudioPlayer.tsx        # مشغل أغنية البوشية الدائري التفاعلي
│   ├── BookingSection.tsx     # نموذج الحجز والتواصل
│   ├── Footer.tsx             # تذييل الموقع
│   ├── HeroSection.tsx        # الواجهة والبانر الرئيسي
│   ├── InfoCards.tsx          # بطاقات تفاصيل الموعد والمكان
│   ├── SilkCanvas.tsx         # خلفية القماش الحريري المتحرك
│   └── SpotlightController.tsx# مؤثرات الإضاءة التفاعلية
├── lib/
│   ├── supabase.ts            # عميل الاتصال بقاعدة بيانات Supabase
│   └── validation.ts          # دوال فحص وتدقيق الاسم والجوال والإيميل
├── public/
│   └── hero-image.svg         # الشعار والصورة الاحتياطية الفاخرة
├── supabase-schema.sql        # كود إنشاء جدول الزوار في Supabase
├── .env.example               # نموذج متغيرات البيئة
├── .env.local                 # ملف المتغيرات المحلي
├── newsite.html               # التصميم الأصلي المرجعي
└── package.json
```
