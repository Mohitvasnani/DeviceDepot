# DeviceDepot

A full-stack e-commerce store for consumer electronics. Browse laptops, phones and accessories, manage a cart and saved items, check out through Stripe, and administer the catalogue and orders from a separate dashboard.

Built solo as a portfolio project with the MERN stack.

**Live:** [device-depot-gilt.vercel.app](https://device-depot-gilt.vercel.app) · API at [devicedepot.onrender.com](https://devicedepot.onrender.com)

> The API is hosted on Render's free tier, which sleeps after inactivity. The first request can take up to a minute while the instance wakes.

---

## Stack

| | |
|---|---|
| Frontend | React 18, Vite, React Router 6, Bootstrap 5, Axios |
| Backend | Node, Express 4, Mongoose 8 |
| Database | MongoDB Atlas |
| Auth | JWT, bcrypt |
| Images | Cloudinary, via multer |
| Payments | Stripe |
| Email | Nodemailer, for password-reset OTPs |
| Hosting | Vercel (frontend), Render (API) |

## Features

**Shopping**
- Catalogue with laptop, mobile and accessories sections
- Product detail pages with a gallery, specification list and live stock
- Cart with quantity controls
- Saved items
- Stripe checkout and order placement
- Order history and per-order tracking

**Accounts**
- Registration and login with JWT, passwords hashed with bcrypt
- Password reset by one-time code sent over email
- Editable profile with multiple delivery addresses
- Role-based access, with admin routes protected by middleware

**Admin dashboard**
- Create, edit and delete products, with multi-image upload to Cloudinary
- Homepage banner management
- View all orders and move them through pending, processing, shipped, delivered and cancelled
- User list and role management

## Design

The interface is built on a small token system in `site-project/src/index.css`: a graphite and concrete palette with a single safety-yellow action colour, a 1.25 modular type scale set in Barlow, and a 4px spacing scale. Bootstrap's CSS variables are overridden from those tokens rather than being fought with `!important`.

Loading states are real skeletons rather than spinners, because the free-tier API can take most of a minute to wake and an empty page is indistinguishable from a broken one.

---

## Running it locally

**Prerequisites:** Node 18 or newer, and a MongoDB Atlas cluster (the free M0 tier is enough).

```bash
git clone https://github.com/Mohitvasnani/DeviceDepot.git
cd DeviceDepot
```

### 1. Backend

```bash
cd backend
npm install
cp env.example.txt .env     # then fill it in, see the table below
npm run server              # nodemon, http://localhost:8080
```

### 2. Seed the database

A fresh cluster has no products, and no admin account. The role-toggle endpoint requires an admin token, so the first admin cannot be created through the API:

```bash
node scripts/seedProducts.js --wipe --admin
```

This inserts 18 products across the three categories and creates an admin user. Credentials are printed on completion and can be set with `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.

Product images default to placeholder URLs so the catalogue renders immediately. Replace them by uploading real images through the admin dashboard, or by filling in `IMAGE_OVERRIDES` at the top of the seed script.

### 3. Frontend

```bash
cd ../site-project
npm install
echo "VITE_API_URL=http://localhost:8080" > .env
npm run dev                 # http://localhost:5173
```

Vite reads `.env` once at startup, so restart the dev server after changing it.

### Diagnostics

If something will not connect, this prints the state of every layer and a verdict, with credentials redacted:

```bash
cd backend && node scripts/check.js
```

---

## Environment

### `backend/.env`

| Variable | Notes |
|---|---|
| `MONGODB_URL` | Atlas SRV string. **Must include the database name** before the `?`, for example `...mongodb.net/devicedepot?retryWrites=true&w=majority`. Without it, Mongoose writes to a database called `test`. |
| `SECRET_KEY` | JWT signing secret |
| `PORT` | Defaults to 8080. Render sets this itself. |
| `CLOUDINARY_CLOUD_NAME` | Product and banner uploads |
| `CLOUDINARY_API_KEY` | |
| `CLOUDINARY_API_SECRET` | |
| `STRIPE_SECRET_KEY` | Checkout payment intents |
| `EMAIL` | Gmail address for OTP delivery |
| `PASSWORD` | Gmail **app password**, not the account password |

### `site-project/.env`

| Variable | Notes |
|---|---|
| `VITE_API_URL` | API base URL, no trailing slash |

---

## API

Base path `/api`. Routes marked **token** require `Authorization: Bearer <jwt>`; **admin** additionally requires the `admin` role.

### Products

| Method | Path | |
|---|---|---|
| `GET` | `/product/allproducts` | |
| `POST` | `/product/addproduct` | multipart, field `files`, max 6 |
| `PUT` | `/product/update/:id` | multipart, field `files`, max 6 |
| `DELETE` | `/product/dltproduct/:id` | |

### Cart and saved items

| Method | Path | |
|---|---|---|
| `POST` | `/product/addcart` | |
| `GET` | `/product/allcart` | |
| `POST` | `/product/increment/:id` | |
| `POST` | `/product/decrement/:id` | |
| `DELETE` | `/product/remove/:itemId` | |
| `POST` | `/product/addlike` | |
| `GET` | `/product/getlike/:email` | |
| `DELETE` | `/product/removelike` | |

### Users

| Method | Path | |
|---|---|---|
| `POST` | `/user/register` | |
| `POST` | `/user/login` | |
| `GET` | `/user/profile/:email` | token |
| `PUT` | `/user/updateprofile/:id` | token |
| `GET` | `/user/users` | admin |
| `PUT` | `/user/updaterole/:id` | admin |
| `DELETE` | `/user/deluser/:id` | admin |

### Orders

| Method | Path | |
|---|---|---|
| `POST` | `/orders/purchase` | token |
| `POST` | `/orders/allorders` | token |
| `POST` | `/orders/view` | token |
| `PUT` | `/orders/cancel` | token |
| `GET` | `/orders/getall` | admin |
| `PUT` | `/orders/updatestatus/:id` | admin |

Also `/banner/*` for homepage banners and `/payments/*` for Stripe intents.

---

## Structure

```
backend/
  controller/     request handlers
  database/       Mongoose connection
  middleware/     JWT auth, Cloudinary upload
  models/         Product, User, Cart, Order, Like, Banner
  routes/         Express routers
  scripts/        seedProducts.js, check.js
  index.js        app entry

site-project/
  src/
    index.css           design tokens and base styles
    assets/
      components/       Navbar, Footer, Productcard, context
      screens/          public pages
      admin/            admin dashboard
      user/             profile and order tracking
      css/              per-screen styles
    App.jsx             routing
```

Note that `components`, `screens`, `admin` and `user` sit under `src/assets/` rather than beside it. That is historical and kept for consistency.

---

## Deployment

### API, on Render

1. New → Web Service, connected to this repository
2. Root directory `backend`, build `npm install`, start `npm start`
3. Add every variable from the backend table above. Leave `PORT` out, Render provides it.
4. In Atlas, allow `0.0.0.0/0` under Network Access. Render's free tier has dynamic outbound IPs, so a narrow allowlist will not work.

### Frontend, on Vercel

1. New Project, connected to this repository
2. Root directory `site-project`, framework Vite, build `npm run build`, output `dist`
3. Set `VITE_API_URL` to the Render URL
4. `vercel.json` already rewrites all paths to `index.html` so client-side routes survive a refresh

`VITE_` variables are inlined at build time, so changing one in Vercel requires a redeploy, not just a restart.

---

## Known limitations

Documented rather than hidden. Tracked in [`REVIEW.md`](REVIEW.md) with fixes.

- Product routes are not yet behind auth middleware
- Several endpoints identify the user from the request body instead of the JWT
- The Stripe amount is calculated client-side
- Stock is not decremented on purchase
- Reset codes are held in memory, so they are lost when the free-tier instance sleeps
- No automated tests

## Licence

MIT
