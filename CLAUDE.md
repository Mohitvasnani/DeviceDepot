# DeviceDepot

Solo MERN e-commerce app (electronics store). Portfolio project, not production.

- Frontend: `site-project/` — React 18 + Vite + Bootstrap 5, deployed to Vercel
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

# seed the database
cd backend && node scripts/seedProducts.js --wipe --admin
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

Frontend routing is in `src/App.jsx`. `ProductsContext` (`src/assets/components/Productcontext.jsx`) holds products, cart and liked state and does the fetching. Admin screens live in `src/assets/admin/`, user screens in `src/assets/user/`, public screens in `src/assets/screens/`.

Note the odd layout: components, screens, admin, user and css all live **under** `src/assets/`, not beside it. Follow it; renaming it is a separate refactor.

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
- `otpStore.js` holds reset OTPs in memory, so they are lost on Render restart or cold start.
- `backend/public/Images/` has ~115 orphaned legacy uploads committed to the repo.
- Render's free tier spins the backend down after inactivity, so the first request after idle takes ~50s. The frontend has no loading state for this.

## Conventions

- CommonJS (`require`) in `backend/`, ESM (`import`) in `site-project/`
- Bootstrap utility classes for layout; per-screen CSS in `src/assets/css/`
- `react-toastify` for user feedback, already wired in `Productcard.jsx` and elsewhere
- Keep commits scoped. Don't reformat files you're not changing.
