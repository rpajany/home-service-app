# Logoipsum Home Service App

A complete JavaScript-only home-service marketplace inspired by the supplied reference screens.

## Stack
- Next.js 16 App Router
- React 19
- JavaScript only (no TypeScript)
- MongoDB + Mongoose
- Tailwind CSS v4
- shadcn-style reusable UI primitives
- JWT session stored in an HttpOnly cookie

## Features
- Home page matching the reference layout
- Category browsing and service search
- Service detail page
- Date + time-slot booking dialog
- MongoDB booking persistence and duplicate slot protection
- Register / login / logout API
- My Bookings page with Booked / Completed tabs
- Responsive navigation
- Local image assets cropped from the supplied reference screenshots
- Demo seed data

## Run

1. Install Node.js 20+.
2. Create `.env.local` from `.env.example`.
3. Start MongoDB locally or use MongoDB Atlas.
4. Install dependencies: `npm install`
5. Seed MongoDB: `npm run seed`

Demo login: `demo@example.com` / `password123`

6. Start the app: `npm run dev`
7. Open http://localhost:3000

## OAuth
The Google/Facebook/Microsoft buttons reproduce the reference UI. They are UI-only until provider credentials are configured. Credential authentication is fully implemented with MongoDB and JWT cookies.

## Production
Set a strong `JWT_SECRET`, production `MONGODB_URI`, and `NEXT_PUBLIC_APP_URL`.

## Account dropdown / Profile

After a successful login, the header now shows the signed-in user's initials and name. Clicking it opens:

- Profile — `/profile`
- My Bookings — `/bookings`
- Logout — clears the HttpOnly session cookie and returns to the home page

The Profile page lets the customer update their name and phone number. Updating the name refreshes the JWT session so the header immediately reflects the new name.

## Admin service-call workflow

Run `npm run seed` to create the admin account:

- Email: `admin@example.com`
- Password: `Admin@12345`

After login, an admin is automatically sent to `/admin`. The header also shows **Admin Dashboard** in the user menu.

Service calls can be processed through:

`Booked -> Confirmed -> Assigned -> In Progress -> Completed -> Closed`

The admin can also cancel a call. The dashboard supports searching, status filtering, provider assignment, live status updates, and operational counters.

## Booking error troubleshooting

Make sure `.env.local` contains a valid MongoDB connection string:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/home-service
JWT_SECRET=replace-this-with-a-long-random-secret
```

Then run:

```bash
npm install
npm run seed
npm run dev
```

The booking API now returns a useful error when a slot is already booked, the date is invalid/past, the selected slot is not offered by the service, or MongoDB is unavailable.

## Provider Management

Admin Dashboard now has a **Providers** tab. Admins can add, edit, delete, deactivate and assign providers to service calls. Provider fields include name, phone, email, service categories, address, city, status, experience and internal notes.

Seeded providers include Jenny Wilson, Emma Potter, Henny Wilson, Harry Will and Raj Kumar.

## Admin Service Call Date Range & Export

The Admin Dashboard > Service Calls tab now supports:
- From Date and To Date filtering (inclusive, based on appointment date).
- Status and text search combined with the date range.
- Clear Filters.
- Export CSV for the currently filtered service calls.
- Export Excel (`.xls`) for the currently filtered service calls. The Excel file is generated client-side and opens in Microsoft Excel without an additional package.

Exports include booking ID, service, category, customer/contact details, appointment date/time, provider, status, address, city, customer notes and admin notes.

## Cloudinary Service Images

Service images in **Admin → Services → Add/Edit Service** are uploaded to Cloudinary when the service is saved. Images are limited to 5 MB. When an existing Cloudinary image is replaced, the previous Cloudinary asset is deleted. When a service is deleted, its Cloudinary image is also deleted (if it was uploaded by this app).

Add these variables to `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create the values in the Cloudinary dashboard. Keep `CLOUDINARY_API_SECRET` server-side; do not prefix it with `NEXT_PUBLIC_`.

### Service image workflow

1. Admin opens **Admin → Services**.
2. Clicks **Add Service** or **Edit**.
3. Chooses an image in **Service Image**.
4. A local preview is shown immediately.
5. Clicking **Create Service** / **Update Service** uploads the image to `home-service/services` in Cloudinary.
6. MongoDB stores the Cloudinary `secure_url` and `public_id` in `Service.image` and `Service.imagePublicId`.
7. Replacing an image removes the old Cloudinary asset.
8. Deleting a service removes its Cloudinary asset when `imagePublicId` is present.

Existing services that still use `/images/...` continue to work; they are not deleted or migrated automatically.


## OAuth setup
Set `NEXTAUTH_SECRET` and the Google, Facebook and Microsoft OAuth client credentials in `.env.local`.
Use these callback URLs in each provider's developer console:
- Google: `http://localhost:3000/api/auth/callback/google`
- Facebook: `http://localhost:3000/api/auth/callback/facebook`
- Microsoft: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
For production, replace `http://localhost:3000` with your deployed site URL. OAuth accounts are mapped to the same MongoDB User collection and receive the app's existing HttpOnly JWT session.

## Company settings
Admin users can open **Profile dropdown → Company** to update company name, Cloudinary logo, address, phone, email, GST, website, tagline and footer text.

## Customer GST
Each saved service address has an optional **GST Number (Optional)** field. The selected address's GST number is snapshotted into the booking.
