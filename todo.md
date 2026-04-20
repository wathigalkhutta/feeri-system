
- [x] إضافة tRPC router لدفتر الأستاذ (General Ledger) يجمع القيود اليومية مع تصفية بالحساب والتاريخ
- [x] إضافة تبويب دفتر الأستاذ في صفحة المحاسبة مع عرض الرصيد المتراكم لكل حساب
- [x] إضافة جدول voucherReceipts في schema.ts لسندات القبض والصرف
- [x] إضافة db helpers و tRPC routers لسندات القبض والصرف
- [x] إضافة تبويب سندات القبض والصرف في صفحة المحاسبة مع نموذج إنشاء وطباعة
- [x] ربط vouchers.create بإنشاء قيد محاسبي تلقائي في journalEntries عند حفظ أي سند قبض أو صرف

## قسم تطوير الأعمال (Business Development)
- [x] إضافة جداول projects, opportunities, internalMessages في schema.ts
- [x] تشغيل db:push لإنشاء الجداول الجديدة
- [x] إضافة db helpers لجداول المشاريع والفرص والرسائل
- [x] إضافة tRPC routers للمشاريع والفرص والرسائل الداخلية
- [x] بناء صفحة BusinessDevelopment.tsx مع لوحة تحكم وتبويبات
- [x] إضافة تبويب المشاريع مع إنشاء/تعديل/حذف وتتبع التقدم
- [x] إضافة تبويب الفرص (CRM خفيف) مع تحويل الفرصة لمشروع
- [x] إضافة تبويب الشراكات مع ربطها بالمشاريع
- [x] بناء نظام المراسلات الداخلية (محادثات فردية وجماعية)
- [x] إضافة القسم للـ Sidebar وتسجيل المسار في App.tsx

## نظام الرسائل الداخلي المحسّن
- [x] إصلاح الديالوج الشفاف في BusinessDevelopment.tsx
- [x] تحديث internalMessages schema لربط المستلم بـ userId حقيقي
- [x] بناء صفحة Messages.tsx مستقلة بصندوق وارد/صادر
- [x] اختيار المستلم من قائمة الموظفين الحقيقيين
- [x] إضافة أيقونة بريد في Header مع عداد الرسائل غير المقروءة
- [x] إضافة قسم الرسائل للـ Sidebar

## استبدال Manus OAuth بنظام Auth مستقل
- [x] إضافة حقل passwordHash في جدول users في schema.ts وتشغيل db:push
- [x] بناء auth router مستقل (register/login/logout/me) باستخدام bcrypt و JWT
- [x] تحديث server context لقراءة JWT من cookie بدلاً من Manus session
- [x] تحديث صفحة تسجيل الدخول لاستخدام email/password بدلاً من OAuth
- [x] إزالة الاعتماد على VITE_OAUTH_PORTAL_URL و Manus OAuth من الكود

## إصلاح تسجيل الدخول
- [x] إنشاء seed script لإضافة المستخدمين التجريبيين في قاعدة البيانات
- [x] تشغيل seed والتحقق من نجاح تسجيل الدخول

## إدارة المستخدمين وتحسينات Auth
- [x] إضافة أمر seed في package.json
- [x] إضافة tRPC routers لإدارة المستخدمين (list/create/updateRole/delete)
- [x] إضافة router لتغيير كلمة المرور (changePassword)
- [x] بناء صفحة Users.tsx لإدارة المستخدمين وتعديل أدوارهم
- [x] إضافة رابط إدارة المستخدمين في Sidebar (خاص بـ owner فقط)
- [x] إضافة تبويب الأمان وتغيير كلمة المرور في Settings.tsx
- [x] إضافة users في ModulePermissions في AuthContext.tsx
- [x] التحقق من TypeScript errors (لا أخطاء)
- [x] تشغيل الاختبارات (6 اختبارات تمر بنجاح)
