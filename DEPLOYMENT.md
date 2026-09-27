# Cloud activation and deployment

## 1) Create Supabase
1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. In Authentication, create the owner user first.
4. Copy Project URL and anon/public key.
5. Edit `config.js` and paste those two values.

## 2) Publish the app
The folder is static and can be deployed to Vercel, Netlify, Cloudflare Pages, or GitHub Pages.
For Vercel: import the repository, keep Framework Preset as Other, and deploy the root directory.

## 3) Booking URL / QR
After deployment, set `bookingBaseUrl` in `config.js` to your deployed `/booking.html` URL.
The app's Settings/Integrations screen can then display the booking link and QR.

## 4) Facebook + Instagram
Meta requires a Business portfolio, Facebook Page, Instagram professional account, Meta developer app, access tokens, webhook endpoint, and permissions/app review for production messaging/comment access. Do not paste permanent access tokens into browser JavaScript. Use a server/edge function for production tokens.

## 5) Email and SMS
Use a server-side function (Supabase Edge Function or another backend) for Resend/Twilio or another provider. Do not expose API secret keys in `config.js`.
