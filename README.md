# siymon — PWA + Admin Orders + Wi‑Fi Thermal Printing

## 1) Install & run
1. Install Node.js (v18+ recommended)
2. In this folder, run:
   - `npm install`
   - `npm start`
3. Open:
   - Customer app: `http://localhost:3000/`
   - Admin dashboard: `http://localhost:3000/admin/`


## 1.1) Security (.env)
- Create `.env` (or copy `.env.example` to `.env`) and set `JWT_SECRET`.
- `ADMIN_PASSWORD` is optional and only used for legacy first-admin login when no admins exist.

## 2) Admin password + WhatsApp + couriers
Edit `config.json`:
- `adminPassword` : كلمة سر المشرف
- `adminWhatsappNumber` : رقم واتساب المطعم (اختياري، باش الزبون يفتح واتساب تلقائياً بعد إرسال الطلب)
- `couriers` : أرقام المكلفين بالتوصيل (تقدر تزيد أكثر من واحد)
- `wifiPrinter.ip` / `wifiPrinter.port` : إعدادات طابعة Wi‑Fi الافتراضية

ثم أعد تشغيل السيرفر.

## 3) Wi‑Fi printing (Important)
- كيمشي مع بزاف ديال طابعات ESC/POS اللي كتقبل RAW TCP على port 9100 (الشائع).
- خاص الطابعة تكون فـ نفس الشبكة LAN مع السيرفر.
- فـ Admin: زر **Wi‑Fi Print** كيسولك على IP/Port وكيطبع.

> إذا طابعتك ماكتقبلش port 9100 (ولا كتحتاج بروتوكول خاص)، قولّي موديلها ونبدل لك الكود.

## 4) HTTPS / Geolocation
- تحديد الموقع فالمتصفح كيتطلب HTTPS (أو localhost).
- إلى رفعتي للسيرفر الحقيقي، الأفضل تستعمل Nginx + SSL.

## 5) Data
- الطلبات كتتحفظ فـ `data/orders.json`.

---

## Production (VPS / Docker)

### ✅ Env checks
- في **production** خاص `JWT_SECRET` يكون موجود (السيرفر كيدير fail-fast).
- `PORT` يتم التحقق منه إذا كان محدد.
- إذا بغيتي تفرض الـ DB: فعل `REQUIRE_DATABASE_URL=1`.

### ✅ Logging
- تمت إضافة **Winston + Morgan** (logs files فـ `./logs` أو `LOG_DIR`).
- ملفات مهمة:
  - `logs/combined.log`
  - `logs/error.log`

### ✅ Health / Readiness
- `GET /health` أو `/healthz`
- `GET /ready` أو `/readyz`
  - تقدر تفعل فحص DB عبر: `HEALTHCHECK_DB=1`

### ✅ Metrics (اختياري)
- فعّل: `METRICS_ENABLED=1`
- endpoint: `GET /metrics`
- إذا بغيتي تحميه: `METRICS_TOKEN=...` واستعمل `Authorization: Bearer <token>`

### ✅ Uploads strategy
- افتراضياً فـ production: `UPLOAD_DIR=./uploads` (خارج `public/`).
- السيرفر كيسيرفها على `UPLOADS_PUBLIC_PATH=/uploads`.
- كاين دعم legacy لـ `public/uploads` باش ما يتكسّر والو.

### ✅ Docker compose
1) نسخ `.env.example` -> `.env` وعمّر المتغيرات (خصوصاً `JWT_SECRET`).
2) شغل:
   - `docker compose up --build`

### ✅ PostgreSQL backup (cron)
سكريبت جاهز: `scripts/pg-backup.sh`

مثال cron (يومي فـ 02:00):
```bash
0 2 * * * cd /path/to/siymon-server-pwa && DATABASE_URL='...' ./scripts/pg-backup.sh >> ./logs/pg-backup.log 2>&1
```

### ✅ Monitoring
- تقدر تشغل بـ **PM2**:
  - `pm2 start ecosystem.config.js`
  - `pm2 monit`
- أو UptimeRobot على `/health`
