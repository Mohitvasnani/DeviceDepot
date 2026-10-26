import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from './cartSlice';

/**
 * Two slices only.
 *
 * Auth and cart are global: several components need to agree about them and
 * react when they change. The product catalogue stays in ProductsContext,
 * because it is fetched once, barely changes, and moving it here would be
 * churn for its own sake.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
});

export default store;
