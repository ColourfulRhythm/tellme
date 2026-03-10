# Paystack Payments Setup

TellMe supports optional paid priority questions. Submitters can attach ₦500–₦5,000 to prioritize their question. Creators receive 90% (platform keeps 10%).

## Requirements

- Supabase (for persistent data)
- Paystack account (Nigeria)
- Vercel (for serverless API routes)

## 1. Run Database Migration

Run `supabase_payments.sql` in your Supabase project after the main `supabase_setup.sql`:

```sql
-- In Supabase SQL Editor, run contents of supabase_payments.sql
```

## 2. Paystack Configuration

1. Create a [Paystack](https://paystack.com) account
2. Get your **Secret Key** from Dashboard → Settings → API Keys
3. Add to Vercel Environment Variables:
   - `PAYSTACK_SECRET_KEY` — your Paystack secret key

## 3. Supabase Service Role Key

The payment webhooks need to write to Supabase. Add:

- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase → Settings → API → service_role key (keep secret!)

## 4. Webhook URL

In Paystack Dashboard → Settings → Webhooks, add:

```
https://your-domain.com/api/paystack/webhook
```

## 5. Vercel Environment Variables

| Variable | Description |
|----------|-------------|
| `PAYSTACK_SECRET_KEY` | Paystack secret key |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

## Phone Verification (Required for Payouts)

Before creators can add their OPay account, they must verify their phone number.

1. **Enable Phone auth** in Supabase: Authentication → Providers → Phone
2. **Configure SMS provider**: Twilio, MessageBird, or Vonage (Supabase Dashboard)
3. See [Supabase Phone Login](https://supabase.com/docs/guides/auth/phone-login) for setup

Creators will receive an OTP via SMS to verify ownership before adding payout details.

## Payouts

- **Platform cut**: 10%
- **Minimum payout**: ₦5,000
- **Bank**: OPay only (creators add account number + name)
- **Schedule**: Monthly batch payouts (manual or automate via Paystack Transfer API)

## Paystack Transfer API (for payouts)

To automate creator payouts, use Paystack Transfer API. OPay bank code: `999992`.
