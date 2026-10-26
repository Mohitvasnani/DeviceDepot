# DeviceDepot review

Read of the full codebase, 25 Oct 2026. Ordered by what to fix first.

Each item says where it is and why it matters. Work top down, one commit per item.

---

## P0: broken right now

### 1. Product detail page shows "No Image" for every product

`site-project/src/assets/screens/Productdisplay.jsx`, image section

```jsx
src={`${API_URL}/${file}`}
```

`files[]` already holds absolute URLs (Cloudinary gives you full URLs, and the seed uses full placeholder URLs). Prefixing the API base produces `http://localhost:5000/https://res.cloudinary.com/...`, which 404s and trips the `onError` fallback.

`Productcard.jsx` does it correctly with a bare `product.files[0]`. Match that in both the thumbnail map and the main image.

### 2. Registration reports success when it fails

`backend/controller/userCtrl.js`, `createUser`

```js
.then(user => res.json(user))
.catch(err => res.json(err))
```

Two problems in two lines:

- The error path returns HTTP **200** with the error body. A duplicate email, a validation failure, anything, and the frontend's `.then()` fires and shows "Registration successful! Please sign in."
- The success path returns the **entire user document, including the bcrypt password hash**, to the browser.

This is most likely why login 401s after a "successful" registration: the second registration silently failed, so the stored hash is from the first attempt with a different password.

Return `res.status(400).json({ error: ... })` on failure, and on success return only `{ id, name, email }`.

### 3. Order totals are never saved

`backend/models/orderModel.js` declares `totalammount`. `backend/controller/orderCtrl.js` reads `totalAmount` from the body and passes `totalAmount` to the model. The names do not match, so Mongoose drops it and every order in the database has no total.

Nobody noticed because `Trackorders.jsx` and `admin/Vieworders.jsx` both recompute the total from `items` at render time. The stored field is dead weight.

Pick one spelling (`totalAmount`), fix the schema, the controller and `Cart.jsx`, and have the order views read the stored value.

---

## P1: security

### 4. Every product route is unauthenticated

`backend/routes/productRoute.js` imports no middleware. `addproduct`, `update/:id` and `dltproduct/:id` are open to the internet. The admin UI is gated in React only, which stops nobody.

`authMiddleware.js` already exports `protect` and `adminOnly`, and the auth and order routers use them. Add them here.

### 5. Identity comes from the request body, not the token

Across `productCtrl.js` and `orderCtrl.js`, the user is resolved with `userModel.findOne({ email })` where `email` is read from `req.body` or `req.query`.

`allOrders`, `viewOrder` and `cancelOrder` do run behind `protect`, but none of them check that the email in the body matches `req.user.email`. Any logged-in user can read or cancel anyone else's orders by changing one field, and the cart and like endpoints need no token at all.

Resolve the user from `req.user.email` and ignore the body entirely. This is the single most serious issue in the codebase.

### 6. Payment amount is set by the client

`backend/controller/paymentCtrl.js` takes `amount` from `req.body`. `Cart.jsx` computes it in the browser and posts it. Anyone can create a payment intent for £0.01 and check out.

Compute the total server-side from the user's cart. Never trust a price from the client.

### 7. Nothing links payment to order

`CheckoutForm.jsx` calls `onSuccess()` after Stripe confirms, which then calls `/api/orders/purchase` as a separate request. The order endpoint has no idea whether payment happened, and a failed network call between the two loses the order entirely.

Minimum fix: pass the `paymentIntent.id` to `purchase` and verify it with Stripe server-side before saving. Proper fix: a Stripe webhook.

### 8. CORS accepts any origin containing "vercel.app"

`backend/index.js`. Any Vercel preview deployment anywhere, owned by anyone, can call this API. The `allowedOrigins` array directly above is declared and never used. Use it.

### 9. No rate limiting

Login, registration and the OTP endpoints have none. `express-rate-limit` is three lines.

---

## P2: correctness

### 10. Adding the same product twice creates two cart rows

`productCtrl.addToCart` always pushes. It should look for an existing item with that `productId` and increment its quantity.

### 11. Stock is never decremented

`Product.quantity` is set at creation and never changes. Buying does not reduce it, so "In Stock (5 available)" is permanently wrong. Decrement inside `purchase`, and reject the order if stock is insufficient.

### 12. `price` is a Number on Product and a String on Cart, Order and Like

Works by accident because JavaScript coerces. Will bite you the moment you sort or sum in a Mongo aggregation. Make them all Number.

### 13. No schema has `timestamps: true`

So there is no real "newest" ordering. `Home.jsx` fakes New Arrivals with `products.slice(-4)`, which is insertion order, not recency. Add `{ timestamps: true }` to every schema.

### 14. OTP store is in memory

`backend/otpStore.js`. Render's free tier spins down on idle, so a password reset started before a cold start fails after it. Move to a TTL collection in Mongo.

### 15. Double DB connection

`database/dbConnect.js` calls `connection()` at module load and also exports it, and `index.js` calls it again. Delete the self-invocation.

### 16. JWT expires in 1h with no refresh

`Navbar.jsx` polls every 60s and force-logs-out on expiry. Functional but hostile: a user filling in a delivery address gets thrown to the login page. Either lengthen the expiry or add a refresh token.

---

## P3: what the project is missing

These are the gaps a reviewer would notice when comparing this to a real store.

**Catalogue**
- No search. For an e-commerce site this is the most conspicuous absence.
- No sorting (price, rating, newest) and no filtering beyond the three hardcoded categories.
- No pagination. `allproducts` returns the entire collection on every page load.
- Categories are a free-text string on the product with three magic values duplicated across `Laptops.jsx`, `Mobiles.jsx` and `Accessories.jsx`. One typo in the admin form and a product vanishes from the site. Make it an enum.

**Product**
- `rating` is a number an admin types in. There are no user reviews, which is the feature people expect behind a star rating.
- Exactly three feature fields, `feature1`, `feature2`, `feature3`. Should be an array.
- No slug, so URLs are not shareable. `/view-product` relies on router state, which means a refresh loses the product and shows "No product selected".

**Orders**
- No confirmation email. `emailCtrl.js` only handles reset OTPs.
- No invoice or receipt.
- No delivery estimate or tracking beyond a status string.

**Engineering**
- No tests of any kind. For a portfolio project this is the gap most likely to come up in an interview.
- No CI. A GitHub Actions workflow running lint and build on push is 20 lines.
- No input validation layer. Zod or Joi on the request bodies would remove a whole class of bug.
- No structured logging or error handling middleware. Every controller repeats its own try/catch and `console.error`.
- `backend/public/Images/` holds ~115 orphaned uploads from the pre-Cloudinary version, committed to the repo.
- `backend/.env` is in the git history at commit `bb0f15b`. Removing it later does not remove it from history.

---

## P4: UI

The structure is sound. The problem is that nothing has been designed, it has been assembled from Bootstrap defaults.

**No design system.** `src/assets/index.css` is 0 bytes. There are no CSS custom properties, no palette, no type scale, no spacing scale. Colours are hardcoded one-offs scattered through JSX: `#21618C` in `Navbar.jsx`, `#31363F` inline in `Home.jsx`. Start here. Everything below gets easier once tokens exist.

**Inline styles everywhere.** `style={{ marginTop: '0px' }}` appears repeatedly in `Home.jsx`, cancelling margins that should not have been applied. Symptom of fighting the framework instead of configuring it.

**Home page.** The hero is the empty-state fallback, a flat grey slab with centred text, because there are no banners in the database. It reads as a placeholder because it is one. Either seed a banner or design a real hero with a product shot and a call to action.

**Section rhythm.** "Top Selling Products" is enormous relative to everything else and sits on a dark band that matches nothing else on the page. Three different background colours in the first viewport, none of them related.

**Product cards.** 300px fixed-height images with `object-fit: contain` leaves large empty margins around every product. The category badge and heart float over the image corners with no background, so they will disappear against a light product photo. The grid is `col-lg-3 col-md-6 col-sm-8`, and `col-sm-8` is not a sensible span, it gives one and a bit cards per row on small tablets.

**Product detail page.** The worst screen. A `col-6` image panel with no responsive fallback, thumbnails clipped and misaligned down the left, a huge empty grey area where the image should be, and the text crammed into the right half with no max width. On a phone this will be unusable.

**Loading and empty states.** There are none. Between page load and the fetch resolving, the user sees headings with nothing under them, which is exactly what you were looking at earlier when debugging. Add skeletons. On Render's free tier the first request takes ~50 seconds, so this is not cosmetic.

**Accessibility.** No focus styles beyond browser defaults, heart buttons are `<i>` elements with click handlers rather than buttons, no `aria-label` on any icon-only control.

### Suggested order

1. Define tokens in `index.css` and replace the hardcoded hex values
2. Fix the product detail layout and make it responsive
3. Add loading skeletons to Home and the category pages
4. Rework the cards: consistent aspect ratio, readable badges
5. Design a real hero

---

## If you only do five things

1. Fix the image URL bug (#1), it makes the site look broken
2. Fix registration returning 200 on failure and leaking the password hash (#2)
3. Put `protect` and `adminOnly` on the product routes (#4)
4. Resolve the user from the token instead of the request body (#5)
5. Compute the payment amount server-side (#6)

Items 3 to 5 are the ones a technical interviewer will find if they read this repo.
