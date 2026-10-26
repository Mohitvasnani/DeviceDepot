# DeviceDepot

Solo MERN e-commerce app (electronics store). Portfolio project, not production.

- Frontend: `site-project/` — React 18 + Vite + Redux Toolkit + Bootstrap 5, deployed to Vercel
- Backend: `backend/` — Express 4 + Mongoose 8, deployed to Render
- DB: MongoDB Atlas
- Images: Cloudinary (via `multer-storage-cloudinary`)
- Payments: Stripe

Live: https://device-depot-gilt.vercel.app (frontend), https://devicedepot.onrender.com (backend)

## Commands

```bash
# backend (port 8080)
cd backend && npm install && npm run server   # nodemon
cd backend && npm start                       # plain node

# frontend (port 5173)
cd site-project && npm install && npm run dev
cd site-project && npm run build
cd site-project && npm run lint               # eslint, --max-warnings 0

# seed the database (36 products + an admin user)
cd backend && node scripts/seedProducts.js --wipe --admin

# user management, instead of editing documents in Compass
cd backend && node scripts/admin.js list
cd backend && node scripts/admin.js password <email> <newPassword>
cd backend && node scripts/admin.js promote <email>
cd backend && node scripts/admin.js fix-indexes

# diagnose env / port / database in one pass
cd backend && node scripts/check.js

# regenerate the product and About artwork
cd site-project && node scripts/make-product-art.mjs
```

There are no tests. Do not claim a change is verified without running the app.

## Environment

`backend/.env` (see `.env.example`):

| Var | Notes |
|---|---|
| `MONGODB_URL` | Atlas SRV string, must include the db name, e.g. `...mongodb.net/devicedepot?retryWrites=true&w=majority` |
| `SECRET_KEY` | JWT signing secret |
| `PORT` | defaults to 8080 |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | product and banner image uploads |
| `STRIPE_SECRET_KEY` | payment intents |
| `EMAIL` / `PASSWORD` | nodemailer Gmail app password, used for OTP password reset |
| `FRONTEND_API` | present in `.env.example`, not read by any code |

`site-project/.env`:

| Var | Notes |
|---|---|
| `VITE_API_URL` | backend base URL, no trailing slash. Read via `import.meta.env` |

Never commit `.env`. Both are gitignored.

## Architecture

Backend is a flat Express app, `index.js` mounts six routers:

```
/api/user      authRoute     register, login, profile, address, manage role
/api/product   productRoute  CRUD, cart, liked items
/api/banner    bannerRoute   homepage banner CRUD
/api/emails    emailRoutes   OTP send/verify for password reset
/api/orders    orderRoute    place and track orders
/api/payments  paymentRoute  Stripe payment intent
```

Layering: `routes/` → `controller/` → `models/`. Controllers are mostly promise chains, not async/await. Keep to the existing style in a file rather than mixing.

Auth is JWT in the `Authorization: Bearer <token>` header, verified by `middleware/authMiddleware.js` (`protect`, `adminOnly`). The token payload is `{ email, role }` and expires in 1h. Frontend stores it in `localStorage` under `token`.

Image uploads go through `middleware/upload.js` (multer + Cloudinary). `req.file.path` / `req.files[].path` are already full Cloudinary URLs; they get stored directly in the document. `backend/public/Images/` is dead weight from the pre-Cloudinary version — nothing new should be written there.

Frontend state is split deliberately:

- **Redux Toolkit** (`src/store/`) owns auth and cart, the two things several
  components must agree about. `authSlice` holds token, email, role, expiry;
  `cartSlice` holds items plus async thunks and derived count and subtotal.
  localStorage still persists the token but is no longer read by components.
- **`ProductsContext`** still owns the catalogue and liked items. It is fetched
  once and barely changes, so moving it to Redux would be churn. Its provider
  value is memoised: a fresh object there re-rendered all 36 cards on any change.

Frontend routing is in `src/App.jsx`. There is exactly one `<ToastContainer>`, in
`App.jsx`. Do not add more; multiple unnamed containers crash react-toastify. Admin screens live in `src/assets/admin/`, user screens in `src/assets/user/`, public screens in `src/assets/screens/`.

Note the odd layout: components, screens, admin, user and css all live **under** `src/assets/`, not beside it. Follow it; renaming it is a separate refactor.

## Design system

`src/index.css` holds the tokens and must stay the **last** import in `main.jsx`,
after Bootstrap, or Bootstrap wins on equal specificity. Colours come from the
logo: ink `#141412`, signal yellow `#f5ce2e`, warm concrete `#ecebe5`. Type is
Barlow and Barlow Condensed on a 1.25 scale; spacing is a 4px scale. Bootstrap is
themed by overriding its CSS variables, not with `!important`.

Never hardcode a colour. If a token is missing, add one.

Product and About artwork is generated, not drawn by hand, by
`site-project/scripts/make-product-art.mjs` into `public/products/` and
`public/about/`. Edit the script and re-run it; do not hand-edit the SVGs.
Brand assets are in `public/brand/`.

## Data model

`Product` — `name`, `rating`, `description`, `feature1`, `feature2`, `feature3`, `quantity`, `instock` (default true), `price`, `categories`, `files: [String]`

`categories` is a single string, not an array, and the frontend filters on exact match against three values only:

- `laptop`
- `mobile`
- `accessories`

Any other value makes the product invisible on the category pages (`Laptops.jsx`, `Mobiles.jsx`, `Accessories.jsx` all pass these literals to `Productfilter.jsx`). `Productcard.jsx` reads `product.files[0]` unguarded, so **every product needs at least one image URL** or the card renders broken.

`User` — `name`, `email` (unique), `phone` (unique Number), `password` (bcrypt), `role` (`user` | `admin`), `admin` (Boolean), `address1-3`

Admin is granted by the role-toggle endpoint, which itself requires an admin token. On a fresh database there is no admin, so the first one has to be created directly in the DB — `scripts/seedProducts.js --admin` does this.

`Order`, `Cart`, `Like` all denormalise product name/description/price/file onto their items. Price is typed `String` on these and `Number` on Product. Known inconsistency, don't "fix" it in passing or it breaks the checkout flow.

No schema has `timestamps: true` and no field other than user email/phone has `required` or validation.

## Known issues

Live, unfixed. Don't be surprised by these, and don't fix them silently as part of unrelated work.

- `database/dbConnect.js` calls `connection()` at module load **and** exports it, and `index.js` calls it again. The DB connects twice on every boot.
- CORS in `index.js` allows any origin containing `localhost` or `vercel.app`. Effectively open. The `allowedOrigins` array above it is declared and never used.
- JWT expires in 1h with no refresh, so the UI silently 401s after an hour.
- `otpStore.js` holds reset OTPs in memory, so they are lost on Render restart or cold start. There is no rate limit on `send-otp`.
- Stock is never decremented on purchase.
- `backend/public/Images/` still exists on disk but is gitignored and unused.
- Render's free tier spins the backend down after inactivity, so the first request after idle takes ~50s. `GET /health` wakes it (and pings Mongo); `site-project/src/main.jsx` calls it once per session on load. Free instance hours are shared across the account, so don't add an always-on pinger.

## Conventions

- CommonJS (`require`) in `backend/`, ESM (`import`) in `site-project/`
- Bootstrap utility classes for layout; per-screen CSS in `src/assets/css/`
- `react-toastify` for user feedback, already wired in `Productcard.jsx` and elsewhere
- Keep commits scoped. Don't reformat files you're not changing.
- The catalogue is fictional: Aerlite laptops, Kestrix phones, Halden accessories. Keep it that way, the artwork is drawn to match.
