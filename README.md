# N's Bridal & Fashion OS — Cloud-Ready V3

This version expands the customized boutique MVP into a cloud-ready web app package.

## Added in V3
- Canva-style visual branding controls and theme swatches
- Inventory photos with cloud upload support when Supabase is connected
- Public `booking.html` inquiry/booking page
- QR generator for the public booking link
- Booking Requests dashboard
- Supabase multi-user authentication structure
- Staff roles in the database schema: owner, manager, staff, accountant
- Cloud database/storage starter schema
- Deployment files for Vercel/static hosting
- Facebook/Instagram integration area with secure production guidance
- Email/SMS integration area for later server-side provider keys
- Existing boutique modules retained: dashboard, inventory, rentals, customers, leads, packages, sales, finance, receipts, tasks, team chat, marketing

## Local demo
Open `index.html`. The app works without any cloud credentials.

## Cloud activation
Read `DEPLOYMENT.md`, create a Supabase project, run `supabase/schema.sql`, then edit `config.js`.

## Security note
Never place secret Meta, SMS, or email API keys directly in browser files. Production messaging integrations should use a server-side function such as Supabase Edge Functions.
