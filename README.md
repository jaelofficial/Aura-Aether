# Aura & Aether Parfums

Luxury fragrance storefront built with Next.js, TypeScript, Tailwind CSS, Prisma and PostgreSQL.

## Getting started

1. Install dependencies: `npm install`
2. Create a local `.env` file and configure `DATABASE_URL` for PostgreSQL and `AUTH_SECRET` with a cryptographically random value of at least 32 characters. Do not use a public or hard-coded secret.
3. Sync the Prisma schema and generate the client: `npx prisma db push` then `npx prisma generate`.
4. Start the development server: `npm run dev`.
5. Open [http://localhost:3000](http://localhost:3000).

## Storefront and admin

- The public homepage is `/`.
- The About page is `/about`.
- Collection pages are `/for-her` and `/for-him`.
- The separate administrator workspace is `/admin`; the visual website editor is `/admin/content`.
- The website editor manages page copy, brand settings, rotating homepage hero slides and product images. Product images can also be changed from the image library in the editor.
- The admin portal uses a separate HTTP-only `aura_admin_token` cookie; customer sessions use `aura_auth_token`.
- The `src/proxy.ts` request guard protects admin pages and redirects an authenticated administrator away from customer storefront pages. Server-side API authorization remains mandatory.
- The site settings API is admin-write-protected at `/api/site-settings`.

The `SiteSetting` model is new; run `npx prisma db push` in each configured environment before using the content editor. Keep credentials in environment variables and never commit `.env`.

### Persistent CMS image uploads

The admin editor uses Cloudinary for persistent image uploads. Create a Cloudinary account, then add these server-side environment variables to your local `.env` file and your deployment environment (for example, Vercel):

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

The variables are listed in `.env.example`. Uploads accept JPG, PNG, WebP, GIF and AVIF files up to 10 MB. SVG uploads are intentionally disabled. The app is configured to display images hosted on `res.cloudinary.com`.

## Production notes

Configure the production PostgreSQL database and environment variables before deployment. Use a unique `AUTH_SECRET`; remove demo credentials before making the store publicly available. Configure Paystack keys through environment variables before accepting live payments.
