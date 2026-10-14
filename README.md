# Landing CMS Pro v4 Complete

Fresh-deploy, GitHub-ready landing page CMS for Hostinger + MySQL.

## Main features
- Secure single-admin login
- Pro / Call / Trust / FOMO / Review landing-page categories
- Master templates + unlimited pages
- Elementor-style drag & drop builder
- Sections, columns, inner sections and elements
- Heading, text, button, image, YouTube, divider, spacer, Form and Raw HTML/CSS/JS elements
- Text/button colors, font size/weight, alignment, spacing, radius and animation controls
- **Zero automatic section/column padding by default**
- **Full-width public rendering on desktop and mobile**
- Global Header editor
- Global Footer editor + sticky option
- GTM / Meta Pixel / GA4 / global HEAD-BODY code
- Page SEO + page-only code
- Built-in Form element + submission storage
- Form submissions admin screen
- Draft / Publish / Duplicate
- Analytics retained from v3

## Fresh Hostinger deployment
1. Upload the contents of this folder to a GitHub repository. `package.json` must be at the selected Root Directory.
2. Create a Hostinger MySQL database.
3. Import `sql/schema-hostinger.sql` in phpMyAdmin.
4. Add the environment variables from `.env.example` in Hostinger. Never commit your real `.env`.
5. Hostinger settings:
   - Install: `npm install`
   - Build: `npm run build`
   - Output: `.next`
   - Start: `npm start`
6. Deploy and open `/admin`.

## Environment variables
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=your_full_hostinger_database_name
MYSQL_USER=your_full_hostinger_database_user
MYSQL_PASSWORD=your_database_password
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
ADMIN_SESSION_SECRET=a-long-random-secret-at-least-32-characters
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Header / Footer
Admin > Header / Footer / Tracking. HTML and CSS are stored globally and rendered around every published landing page.

## Forms
Add a **Form** element in the visual builder. Edit the Fields JSON in the right settings panel. Submitted data appears in **Admin > Form Submissions**.

Example fields JSON:
```json
[
  {"label":"Name","name":"name","type":"text","required":true},
  {"label":"Phone","name":"phone","type":"tel","required":true},
  {"label":"Message","name":"message","type":"textarea","required":false}
]
```

## Padding behavior
New sections, columns and inner sections begin with 0px padding and 0px gap. Padding appears only when you explicitly add it in the builder.
