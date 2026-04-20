# Feeri System — إعداد متغيرات البيئة

## المتغيرات المطلوبة (فقط متغيران أساسيان)

أنشئ ملف `.env` في جذر المشروع بالمحتوى التالي:

```env
# قاعدة البيانات MySQL
DATABASE_URL=mysql://root:password@localhost:3306/feeri_db

# مفتاح JWT للمصادقة (يجب أن يكون عشوائياً وطويلاً)
JWT_SECRET=change_this_to_a_long_random_secret_key_at_least_32_chars
```

## توليد JWT_SECRET عشوائي

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## أمثلة DATABASE_URL

### MySQL محلي
```
DATABASE_URL=mysql://root:mypassword@localhost:3306/feeri_db
```

### MySQL على سيرفر
```
DATABASE_URL=mysql://feeri_user:strongpassword@192.168.1.100:3306/feeri_db
```

### TiDB Cloud
```
DATABASE_URL=mysql://user:password@gateway.tidbcloud.com:4000/feeri_db?ssl={"rejectUnauthorized":true}
```

## خطوات التشغيل

```bash
# 1. تثبيت الحزم
pnpm install

# 2. إنشاء ملف .env (انسخ المثال أعلاه)

# 3. إنشاء جداول قاعدة البيانات
pnpm db:push

# 4. إضافة المستخدمين التجريبيين (اختياري)
pnpm seed

# 5. تشغيل السيرفر
pnpm dev
```

## بيانات الدخول التجريبية

| البريد الإلكتروني | كلمة المرور | الدور |
|---|---|---|
| owner@feeri.com | password123 | مالك الشركة |
| manager@feeri.com | password123 | مدير |
| employee@feeri.com | password123 | موظف |

## ملاحظات

- لا تحتاج إلى أي متغيرات OAuth أو Manus — النظام مستقل بالكامل
- `JWT_SECRET` يُستخدم لتشفير cookies المصادقة — لا تشاركه مع أحد
- `DATABASE_URL` يجب أن يشير لقاعدة بيانات MySQL 8+ أو TiDB
- لا تشارك ملف `.env` أبداً أو ترفعه على GitHub
