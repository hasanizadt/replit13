
## راه‌اندازی اولیه سیستم

برای راه‌اندازی اولیه سیستم، پس از اجرای سرور، مراحل زیر را دنبال کنید:

1. به GraphQL Playground در آدرس `http://localhost:3000/graphql` مراجعه کنید.

2. وضعیت سیستم را بررسی کنید:
   ```graphql
   query {
     getSystemStatus {
       databaseConnected
       redisConnected
       filesystemAccessible
       adminAccountExists
       requiredTablesExist
       schemaUpToDate
       systemVersion
       timestamp
     }
   }
   ```

3. مراحل راه‌اندازی را مشاهده کنید:
   ```graphql
   query {
     getSetupProgress {
       steps {
         id
         name
         description
         status
         order
         isRequired
       }
       completedSteps
       totalSteps
       progressPercentage
       isCompleted
       hasErrors
     }
   }
   ```

4. هر مرحله از راه‌اندازی را به ترتیب اجرا کنید:
   ```graphql
   mutation {
     runSetupStep(input: { stepId: "database_check" }) {
       success
       message
       error
       step {
         id
         name
         status
       }
     }
   }
   ```

5. مراحل راه‌اندازی به ترتیب عبارتند از:
   - `database_check`: بررسی اتصال به پایگاه داده
   - `system_init`: مقداردهی اولیه سیستم
   - `admin_user`: ایجاد کاربر مدیر
   - `base_categories`: ایجاد دسته‌بندی‌های پایه
   - `base_attributes`: ایجاد ویژگی‌های پایه
   - `sample_products`: ایجاد محصولات نمونه
   - `finalize_setup`: نهایی‌سازی راه‌اندازی

6. پس از تکمیل تمام مراحل، سیستم آماده استفاده است.

## مستندات API

برای دسترسی به مستندات کامل API، پس از اجرای سرور، به GraphQL Playground در آدرس زیر مراجعه کنید:
```
http://localhost:3000/graphql
```

## ویژگی‌های پیشرفته

این پروژه دارای ویژگی‌های پیشرفته زیر است:

### سیستم اعلان‌های بلادرنگ (Notification)
- پشتیبانی از انواع مختلف اعلان‌ها (سیستمی، سفارش، پرداخت، محصول، و غیره)
- ارسال اعلان به کاربران خاص یا به صورت عمومی
- ذخیره‌سازی و مدیریت تاریخچه اعلان‌ها

### چندزبانگی (Translation)
- پشتیبانی کامل از چندین زبان 
- ترجمه پویای محتوا (محصولات، دسته‌بندی‌ها، و غیره)
- تشخیص خودکار زبان کاربر

### گزارش‌گیری (Reporting)
- تولید گزارش‌های متنوع در فرمت‌های مختلف
- زمان‌بندی خودکار گزارش‌ها
- ذخیره‌سازی و مدیریت گزارش‌ها

### سیستم نظرسنجی (Feedback)
- ثبت نظرات کاربران درباره محصولات، سفارش‌ها و فروشندگان
- رتبه‌بندی و امتیازدهی
- مدیریت و پاسخ به نظرات

### سیستم API Key
- ایجاد و مدیریت کلیدهای API برای توسعه‌دهندگان خارجی
- کنترل دقیق سطوح دسترسی
- ردیابی و محدودسازی استفاده

### سیستم Webhook
- پشتیبانی از ارسال رویدادهای مختلف سیستم به سرویس‌های خارجی
- امنیت بالا با استفاده از امضای دیجیتال
- ردیابی و مدیریت ارسال‌ها

### سیستم ردیابی وضعیت (Status Tracking)
- ثبت و پیگیری تمام تغییرات وضعیت برای سفارش‌ها، محصولات و غیره
- تاریخچه کامل تغییرات
- گزارش‌گیری از زمان‌بندی تغییرات

### سیستم تحلیل پیشرفته (Advanced Analytics)
- داشبورد مدیریتی با شاخص‌های کلیدی عملکرد
- تحلیل روندها و الگوها
- شناسایی ناهنجاری‌ها و هشدارها

### سیستم پشتیبانی و تیکتینگ (Support & Ticketing)
- مدیریت تیکت‌های پشتیبانی با سطوح اولویت متفاوت
- امکان ارسال پاسخ توسط کاربر و پشتیبان
- پیگیری وضعیت تیکت‌ها و تخصیص به کارشناسان
- آمارگیری و گزارش‌های عملکرد سیستم پشتیبانی

## در مورد سیستم پشتیبانی و تیکتینگ

سیستم پشتیبانی و تیکتینگ به کاربران امکان می‌دهد سؤالات و مشکلات خود را مطرح کرده و پاسخ دریافت کنند:

### ویژگی‌های اصلی:

1. **تیکت‌ها**:
   - ثبت تیکت با موضوع، پیام و اولویت
   - امکان افزودن فایل‌های پیوست
   - نمایش تاریخچه کامل هر تیکت
   - مرتب‌سازی و فیلتر بر اساس وضعیت، اولویت و دپارتمان

2. **پاسخ‌ها**:
   - امکان پاسخ‌دهی به تیکت‌ها توسط کاربران و پشتیبان‌ها
   - اطلاع‌رسانی از طریق اعلان‌ها هنگام دریافت پاسخ جدید
   - تغییر خودکار وضعیت تیکت بر اساس پاسخ‌های ارسالی

3. **مدیریت**:
   - تخصیص تیکت‌ها به کارشناسان پشتیبانی
   - تعیین اولویت و دسته‌بندی تیکت‌ها
   - تنظیم دپارتمان‌های پشتیبانی مختلف

4. **آمار و گزارش‌ها**:
   - آمار تعداد تیکت‌ها به تفکیک وضعیت
   - میانگین زمان پاسخگویی اولیه
   - میانگین زمان حل مشکل
   - نرخ رضایت مشتریان

### نحوه استفاده:

**برای کاربران**:
1. ایجاد تیکت جدید:
   ```graphql
   mutation {
     createTicket(createTicketInput: {
       subject: "مشکل در پرداخت",
       message: "هنگام پرداخت با خطای زیر مواجه شدم...",
       priority: HIGH,
       department: "مالی"
     }) {
       id
       subject
       status
       priority
       createdAt
     }
   }
   ```

2. مشاهده تیکت‌های شخصی:
   ```graphql
   query {
     getMyTickets(searchInput: { page: 1, limit: 10 }) {
       tickets {
         id
         subject
         status
         priority
         createdAt
       }
       totalCount
       pageCount
     }
   }
   ```

**برای مدیران**:
1. مشاهده همه تیکت‌ها:
   ```graphql
   query {
     getAllTickets(searchInput: { 
       status: OPEN, 
       priority: HIGH,
       page: 1, 
       limit: 20 
     }) {
       tickets {
         id
         subject
         status
         user {
           firstName
           lastName
         }
       }
       totalCount
     }
   }
   ```

2. به‌روزرسانی وضعیت تیکت:
   ```graphql
   mutation {
     updateTicket(updateTicketInput: {
       id: "ticket-id",
       status: IN_PROGRESS,
       assignedToId: "admin-id"
     }) {
       id
       status
       assignedTo {
         firstName
         lastName
       }
     }
   }
   ```
# replit10
# replit11
# replit12
# replit13
# replit14
# replit13
