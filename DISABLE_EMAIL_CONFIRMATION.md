# تعطيل تأكيد البريد الإلكتروني في Supabase

## المشكلة:
عند تسجيل الدخول يظهر خطأ "Email not confirmed"

## الحل:

### الطريقة 1: تعطيل Email Confirmation (للتطوير)

1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك: **flivraxgfeqrguienahe**
3. اذهب إلى **Authentication** → **Settings** (أو **Configuration**)
4. ابحث عن **"Enable email confirmations"** أو **"Confirm email"**
5. **عطّل** الخيار (Toggle OFF)
6. احفظ التغييرات

### الطريقة 2: استخدام Email Confirmation (للإنتاج)

إذا أردت الاحتفاظ بتأكيد البريد:
1. بعد التسجيل، سيتم إرسال رابط تأكيد للبريد
2. المستخدم يجب أن ينقر على الرابط لتأكيد الحساب
3. بعد التأكيد، يمكنه تسجيل الدخول

### ملاحظة:
- للتطوير المحلي: عطّل Email Confirmation
- للإنتاج: فعّل Email Confirmation للأمان

## بعد تعطيل Email Confirmation:

1. أعد تشغيل السيرفر
2. جرب تسجيل حساب جديد
3. يجب أن يعمل تسجيل الدخول مباشرة بدون تأكيد

## إذا استمرت المشكلة:

1. تحقق من أنك عطّلت Email Confirmation في Supabase Dashboard
2. تأكد من حفظ التغييرات
3. انتظر بضع ثوانٍ حتى يتم تطبيق التغييرات
4. جرب تسجيل حساب جديد

