# MGI SaaS Ultra
Enterprise-grade, multi-tenant chatbot SaaS with admin portal, per-company limits/pause, OTP login, embed widget, watermark, and bilingual UI.

## Deploy (Vercel)
1) Set env:
- DEEPSEEK_API_KEY
- DATABASE_URL (Postgres with sslmode=require)
- ADMIN_EMAIL, ADMIN_PASSWORD
- ADMIN_INVITE_CODE (optional)
- EMAIL_OTP_ENABLED=1 (optional)
- SMTP_* (optional; otherwise OTP code logged to console)
2) Push to GitHub → Vercel builds (`prisma db push` + `next build`)
3) Create your first company from **/admin** or via **/register** (if you enable invite code).
4) Use **/dashboard** for company settings; **/embed/widget.js?companyId=ID** to embed bubble.

## Notes
- No DeepSeek branding is shown.
- Limits and pause enforced at API level.
- Watermark can be toggled per company by admin.
