# Going live: Supabase, Google sign-in and Dodo Payments

The code is ready. These steps connect it to your accounts. Takes about 20 minutes.
Keep every key private: put them only in `.env.local` and in Vercel, never in chat or git.

## 1. Supabase (database)

1. Go to [supabase.com](https://supabase.com) → **New project**. Pick a region close to your users (e.g. Mumbai).
2. Open **SQL Editor → New query**, paste all of [`supabase/schema.sql`](supabase/schema.sql), click **Run**.
3. New query again, paste [`supabase/seed.sql`](supabase/seed.sql), **Run**. This adds the sample products.
   You can remove them later with `delete from public.products where maker_id is null;`
4. Open **Project Settings → API Keys** and keep this tab open. You need:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Publishable key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - Secret key → `SUPABASE_SECRET_KEY`

## 2. Google sign-in

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → create a project called **WeekLaunch**.
2. **APIs & Services → OAuth consent screen**: choose **External**, app name *WeekLaunch*, your support email,
   and add your domain under authorized domains. Publish the app when you're done testing.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID → Web application**:
   - Authorized JavaScript origins: `https://weeklaunch.vercel.app` and `http://localhost:3000`
   - Authorized redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
     (Supabase shows this exact link on the Google provider page.)
4. Copy the **Client ID** and **Client secret**.
5. In Supabase: **Authentication → Sign In / Providers → Google** → turn on, paste both, save.
   Turn **Email** off there too, since the site only uses Google.
6. In Supabase: **Authentication → URL Configuration**:
   - Site URL: `https://weeklaunch.vercel.app`
   - Redirect URLs: `https://weeklaunch.vercel.app/auth/callback` and `http://localhost:3000/auth/callback`

## 3. Dodo Payments

Start in **Test mode** (switch at the top of the Dodo dashboard).

1. **Products → Add product**, one-time payment:
   - *Premium launch*, $29 → copy its id → `DODO_PREMIUM_PRODUCT_ID`
   - *Launch boost*, $19 → copy its id → `DODO_BOOST_PRODUCT_ID`
2. **Developer → API Keys → Add API key** → `DODO_PAYMENTS_API_KEY`
3. **Developer → Webhooks → Add endpoint**:
   - URL: `https://weeklaunch.vercel.app/api/webhooks/dodo`
   - Events: `payment.succeeded`, `payment.failed`, `refund.succeeded`
   - Copy the signing secret → `DODO_PAYMENTS_WEBHOOK_KEY`
4. Set `DODO_PAYMENTS_ENVIRONMENT=test_mode` for now.

## 4. Add the keys

1. Copy [`.env.example`](.env.example) to `.env.local` and fill in every value. Put your own email in `ADMIN_EMAILS`.
2. In **Vercel → weeklaunch → Settings → Environment Variables**, add the same values (Production and Preview).
3. **Deployments → ⋯ → Redeploy** so the new values are used.

## 5. Test it end to end

1. Open the site → **Sign in** → Continue with Google. Your avatar appears top right.
2. **Launch product** → fill it in → choose **Free** → submit.
3. Open **/admin** (only emails in `ADMIN_EMAILS` can) → **Approve**.
4. When its week starts, it shows on the home board. Upvote it and leave a comment.
5. Submit another one with **Premium** → you land on Dodo checkout → pay with a Dodo test card.
   Back on **My launches** it changes from *Waiting for payment* to *In review* within a few seconds.

When it all works, create the same two products and a webhook in Dodo **Live mode**, use the live
API key and webhook secret in Vercel, set `DODO_PAYMENTS_ENVIRONMENT=live_mode` and redeploy.

## How it works

- **Sign-in**: Google through Supabase Auth. A profile is created automatically on first sign-in.
- **Launches**: saved as *In review* (free) or *Waiting for payment* (Premium or Boost). Paid ones move to
  *In review* when Dodo confirms the payment. You approve them at `/admin`.
- **Weeks**: Monday to Sunday (UTC). Premium picks any of the next 3 weeks (5 spots each); free launches
  join the queue 3 weeks out.
- **Security**: every table has row level security. Payments and launch status can only be changed by the
  server, and the Dodo webhook checks its signature before marking anything paid.
- **Not included yet**: email notifications (the toggles are saved, but no emails are sent) and the
  visitor counters in the right column, which are still placeholder numbers.
