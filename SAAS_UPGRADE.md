# SaaS Upgrade Notes (Multi‑Tenant + Subscriptions + Security)

هذا الملف يشرح التغييرات التي تمت **بدون حذف أو تخريب** أي شيء من النظام الحالي.

## ✅ ما الذي تمت إضافته الآن

### 1) Multi‑Tenant (Restaurant Isolation)
- كان عندك أصلاً دعم `restaurants` و `restaurantId` في `orders/menu`.
- تم تحسين إنشاء الطلبات بحيث:
  - إذا لم يرسل العميل `restaurantId` يتم اختيار أول مطعم فعّال تلقائياً (Backward compatible).
  - يتم منع الطلب إذا كان المطعم معطّل أو الاشتراك غير فعّال أو تجاوز حد الطلبات الشهري.

### 2) نظام الاشتراكات (Plans + Limits)
- تمت إضافة ملف: `data/plans.json` (يتولد تلقائياً عند أول تشغيل) ويحتوي خطط:
  - Basic / Pro / Enterprise
- تمت إضافة حقول داخل المطعم:
  - `subscriptionPlan`, `subscriptionStatus`, `subscriptionRenewsAt`, ...
- Endpoints جديدة:
  - `GET /api/admin/plans`
  - `PUT /api/admin/plans`

### 3) Refresh Tokens (JWT + Rotating Refresh)
- تمت إضافة:
  - `data/refresh_tokens.json`
  - `POST /api/auth/refresh`
  - `POST /api/auth/logout`
- كل تسجيل دخول (Admin/Customer/Driver/Restaurant) الآن يرجع:
  - `token` (Access token) + `refreshToken`

> الواجهة الحالية مازالت تشتغل لأننا لم نغيّر اسم `token`.

### 4) Audit Logs
- تمت إضافة:
  - `data/audit_logs.json`
  - Middleware يسجّل تلقائياً أي طلب (POST/PUT/PATCH/DELETE) تحت `/api/*`.
  - Endpoint:
    - `GET /api/admin/audit-logs?limit=200&offset=0`

### 5) RBAC داخل المطعم (Restaurant Staff)
- تمت إضافة نظام موظفين للمطعم (Owner/Manager/Cashier) بدون كسر Login القديم.
- ملفات + Endpoints:
  - `data/restaurant_users.json`
  - `POST /api/admin/restaurant-users`
  - `GET  /api/admin/restaurant-users?restaurantId=...`
  - `PATCH /api/admin/restaurant-users/:id`
  - `POST /api/restaurant-user/login`
  - `GET  /api/restaurant-user/me`

> هذا يمكّنك لاحقاً من منع cashier من تغيير الإعدادات مثلاً.

### 6) Dashboard / Reports APIs
- Endpoints جديدة للـ Dashboard:
  - `GET /api/admin/stats?restaurantId=...`
  - `GET /api/restaurant/stats`
- Export Excel (CSV يفتح مباشرة في Excel):
  - `GET /api/admin/reports/orders.csv?restaurantId=...`
  - `GET /api/restaurant/reports/orders.csv`

### 7) Deployment (Docker + Compose)
- تمت إضافة:
  - `Dockerfile`
  - `docker-compose.yml` (App + PostgreSQL + Redis)

## 🔧 متغيرات مهمة في .env
- `JWT_SECRET` (ضروري للإنتاج)
- `FORCE_HTTPS=1` (اختياري)
- `REFRESH_TOKEN_EXPIRES_DAYS=30`
- `DATABASE_URL` (مرحلة 1 للانتقال إلى PostgreSQL)

## 🐘 PostgreSQL Migration (مرحلة 1)
- تم إضافة Prisma Schema: `prisma/schema.prisma`
- سكريبت نقل البيانات: `scripts/migrate-json-to-db.js`

الخطوات:
1) ضع `DATABASE_URL` في `.env`
2) `npm install`
3) `npx prisma db push`
4) `node scripts/migrate-json-to-db.js`

> النظام الحالي مازال يستخدم JSON. الانتقال إلى DB سيكون تدريجي (نضيف V2 routes ثم نبدّل المصدر).

## ملاحظات مهمة
- لم يتم حذف أي endpoint قديم.
- تمت إضافة خصائص جديدة فقط، مع الحفاظ على التوافق.
