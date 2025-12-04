# گزارش نهایی سامانه‌ی Express (فاز دوم)

این سند جمع‌بندی فنی پروژه‌ی «Express System» است که در فاز دوم به سطح Production ارتقاء یافته. محورها شامل معماری، میان‌افزارها، مدل داده، API‌ها، امنیت، تست‌ها و دستورالعمل بهره‌برداری است.

---

## ۱. چشم‌انداز و اهداف
- ارائه‌ی API امن با ساختار MVC و میان‌افزارهای پیشرفته (CORS، Helmet، Morgan، Compression، Timeout، Rate-limit، Auth و غیره)
- تعریف استاندارد پاسخ‌ها و مدیریت خطاهای Async
- اعتبارسنجی ورودی‌ها با express-validator و جلوگیری از تزریق داده
- آماده‌سازی خروجی مستندسازی‌شده برای استقرار و ارائه‌ی درسی

## ۲. ساختار پروژه
```
express_system/
├── app.js                 # پیکربندی کامل Express و زنجیره‌ی میان‌افزارها
├── index.js               # راه‌اندازی HTTP/HTTPS و بارگذاری app
├── controllers/
│   ├── auth.js            # ثبت‌نام، ورود، رفرش و خروج
│   └── user.js            # CRUD پروفایل‌ها (با asyncHandler + formatResponse)
├── middleware/
│   ├── apiKey.js          # الزام API Key
│   ├── asyncHandler.js    # مدیریت خطاهای Promise
│   ├── errorHandler.js    # جمع‌بندی خطاها
│   ├── formatResponse.js  # قالب استاندارد خروجی
│   ├── logger.js          # Morgan (کنسول + فایل)
│   ├── requestTimeout.js  # Timeout قابل‌پیکربندی
│   └── auth.js            # JWT Guard
├── models/user.js         # نگه‌داری کاربران و پروفایل‌ها در حافظه + Refresh Token
├── routes/
│   ├── auth.js
│   └── user.js
├── validators/userValidators.js
├── tests/smoke.js         # تست دود با supertest
└── docs/
    ├── REPORT.md          # همین سند
    └── PRESENTATION.md    # اسلاید ارائه
```

## ۳. پیکربندی محیط
| متغیر | نقش |
| --- | --- |
| `PORT` / `HOST` | پورت و میزبان سرویس HTTP |
| `HTTPS_ENABLED`, `HTTPS_PORT`, `SSL_*` | فعال‌سازی SSL محلی |
| `ALLOWED_ORIGINS` | دامنه‌های مجاز CORS (لیست comma-separated) |
| `API_KEY` | کلید دسترسی اجباری برای همه‌ی درخواست‌ها |
| `REQUEST_TIMEOUT_MS` | حداکثر زمان پاسخ قبل از 503 |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` | تنظیمات rate-limit |
| `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `*_EXPIRES_IN` | تنظیمات توکن |

نمونه `.env` در ریشه‌ی پروژه قرار دارد.

## ۴. معماری و جریان درخواست
```mermaid
graph TD
  A[Client Request] --> B[Helmet & Compression]
  B --> C[Body Parser + FormatResponse]
  C --> D[Request Timeout]
  D --> E[Morgan Logger]
  E --> F[CORS Guard]
  F --> G[Rate Limiter]
  G --> H[API Key Middleware]
  H --> I[/api/auth routes]
  H --> J[JWT Guard (/api/**)]
  J --> K[/api/users routes]
  I --> L[Controllers + express-validator]
  K --> L
  L --> M[FormatResponse success/error]
  M --> N[Client Response]
```

## ۵. کاتالوگ میان‌افزارها
| لایه | هدف | فایل |
| --- | --- | --- |
| Helmet | پیشگیری از XSS ،Clickjacking و Sniffing | `app.js` |
| Compression | کاهش حجم پاسخ‌ها | `app.js` |
| Express JSON (25KB limit) | جلوگیری از بدنه‌های بزرگ | `app.js` |
| Format Response | استانداردسازی خروجی | `middleware/formatResponse.js` |
| Request Timeout | خاتمه‌ی تمیز درخواست‌های طولانی | `middleware/requestTimeout.js` |
| Morgan Logger | ثبت در کنسول و `access.log` | `middleware/logger.js` |
| CORS پویا | کنترل دامنه‌های مجاز و preflight | `app.js` |
| Rate Limit | حداکثر ۱۰۰ درخواست در ۱۵ دقیقه | `app.js` |
| API Key Guard | الزام `X-API-Key` | `middleware/apiKey.js` |
| JWT Auth | محافظت از `/api/**` | `middleware/auth.js` |
| Async Handler | مدیریت خطاهای Promise | `middleware/asyncHandler.js` |
| Error Handler | تبدیل استک‌ها به پاسخ استاندارد | `middleware/errorHandler.js` |

## ۶. مدل داده و اعتبارسنجی
- **مدل کاربران** (`models/user.js`):
  - ذخیره‌ی حساب‌های auth (username/password هش‌شده) و refresh token ها
  - دیتاست مجزا برای پروفایل‌ها (name, age, timestamps)
- **اعتبارسنجی** (`validators/userValidators.js`):
  - `name`: رشته، trim شده، غیرخالی
  - `age`: عدد صحیح مثبت
  - `id`: پارامتر مثبت
- **میان‌افزار `validateRequest`**: خطاهای express-validator را به پاسخ استاندارد تبدیل می‌کند.

## ۷. مسیرهای API
| مسیر | متد | توضیح | محافظت |
| --- | --- | --- | --- |
| `/health` | GET | بررسی وضعیت سامانه | API Key |
| `/api/auth/register` | POST | ثبت‌نام کاربر (username/password/firstname/lastname) | API Key |
| `/api/auth/login` | POST | ورود و دریافت access/refresh token | API Key |
| `/api/auth/refresh` | POST | دریافت توکن جدید از refresh معتبر | API Key |
| `/api/auth/logout` | POST | ابطال refresh token ارسال‌شده | API Key |
| `/api/users` | GET | لیست پروفایل‌ها | API Key + JWT |
| `/api/users/:id` | GET | جزئیات پروفایل | API Key + JWT + Validation |
| `/api/users` | POST | ایجاد پروفایل جدید (name, age) | API Key + JWT + Validation |
| `/api/users/:id` | PUT | ویرایش پروفایل | API Key + JWT + Validation |
| `/api/users/:id` | DELETE | حذف پروفایل | API Key + JWT + Validation |

تمام پاسخ‌ها به شکل زیرند:
```json
{
  "success": true/false,
  "data" | "error": {...},
  "timestamp": "ISO8601"
}
```

## ۸. لایه‌های امنیتی و بهینه‌سازی
1. **Helmet**: هدرهای امنیتی مرورگر
2. **HTTPS اختیاری**: با گواهی محلی (قابل فعال‌سازی با `.env`)
3. **API Key**: کنترل دسترسی coarse-grained
4. **JWT**: مجوز ریزدانه برای مسیرهای محافظت‌شده
5. **Rate limiting + Timeout**: محافظت در برابر DoS/slowloris
6. **CORS کنترل‌شده**: جلوگیری از origins ناشناس
7. **Validation + Sanitization**: سد در برابر تزریق داده

## ۹. مشاهده‌پذیری و عملیات
- **Morgan** (dev + combined) → کنسول + فایل `access.log`
- **نمونه لاگ**:
```
::ffff:127.0.0.1 GET /health 401 121 - 31.795 ms
::ffff:127.0.0.1 GET /health 200 78 - 3.288 ms
::ffff:127.0.0.1 POST /api/users 400 262 - 22.592 ms
::ffff:127.0.0.1 POST /api/users 201 176 - 3.763 ms
```
- امکان ارسال لاگ‌ها به سیستم‌های خارجی (ELK/Grafana) در آینده فراهم است.

## ۱۰. تست‌ها
- اسکریپت دود `npm test` از `tests/smoke.js` استفاده می‌کند و با supertest سناریوهای زیر را می‌سنجد:

| سناریو | ورودی | خروجی |
| --- | --- | --- |
| نبود API Key | `GET /health` بدون هدر | 401 Unauthorized |
| CORS و سلامت | `GET /health` با `X-API-Key` | پاسخ موفق `status: ok` |
| ثبت‌نام و ورود | `POST /api/auth/register`، `POST /api/auth/login` | دریافت access/refresh token |
| خطای Validation | `POST /api/users` با `name:"", age:-2` | پیام "Validation failed" + جزئیات |
| ایجاد موفق | `POST /api/users` با داده صحیح | پاسخ 201 + پروفایل |
| خواندن | `GET /api/users` | آرایه‌ی کاربران |

اجرای نمونه (خروجی کنسول در تاریخ ۲ دسامبر ۲۰۲۵ ثبت شد) نشان می‌دهد تمامی سناریوها پاس شده‌اند.

## ۱۱. نحوه‌ی اجرا و استقرار
```powershell
cd d:\Uni\internet engineering matin\mongodb_vs_redis\Internet-Engineering-Exes\express_system
npm install
npm start
```
- برای فعال کردن HTTPS: `HTTPS_ENABLED=true` و مشخص‌کردن مسیر گواهی/کلید.
- برای تست سریع: `npm test` (پیش‌فرض از `API_KEY` موجود در `.env` استفاده می‌کند).

## ۱۲. نمونه پاسخ‌ها
- موفق:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Ali Reza",
        "age": 25,
        "createdAt": "2025-12-02T18:37:16.259Z",
        "updatedAt": "2025-12-02T18:37:16.259Z"
      }
    ]
  },
  "timestamp": "2025-12-02T18:37:16.400Z"
}
```
- خطای اعتبارسنجی:
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "status": 400,
    "details": [
      { "msg": "Name must be a non-empty string", "location": "body", "value": "" },
      { "msg": "Age must be a positive integer", "location": "body", "value": -2 }
    ]
  },
  "timestamp": "2025-12-02T18:37:15.901Z"
}
```
