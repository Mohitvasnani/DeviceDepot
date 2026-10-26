import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import axios from 'axios';

/**
 * Cart state.
 *
 * Every component that changes the cart dispatches here, so the navbar badge,
 * the product cards and the cart page always agree. Previously the cart page
 * held its own copy in useState and nothing outside it could see a change.
 *
 * The API identifies the cart by email in the request body, which is a
 * separate problem (see REVIEW.md item 5). These thunks read the email from
 * auth state rather than from localStorage so there is one source of truth
 * until that is fixed server-side.
 */

const API_URL = import.meta.env.VITE_API_URL;

const authBits = (getState) => {
  const { token, email } = getState().auth;
  return { token, email, headers: { Authorization: `Bearer ${token}` } };
};

export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { getState, rejectWithValue }) => {
    const { email, headers } = authBits(getState);
    if (!email) return { items: [] };
    try {
      const { data } = await axios.get(`${API_URL}/api/product/allcart`, {
        params: { email },
        headers,
      });
      return { items: data?.items ?? [] };
    } catch (err) {
      // No cart yet is a 404 from this API, which is not an error state
      if (err.response?.status === 404) return { items: [] };
      return rejectWithValue(err.response?.data?.error || 'Could not load your cart');
    }
  }
);

export const addItem = createAsyncThunk(
  'cart/add',
  async (productId, { getState, dispatch, rejectWithValue }) => {
    const { email, headers } = authBits(getState);
    if (!email) return rejectWithValue('Sign in to add items to your cart');
    try {
      const { data } = await axios.post(
        `${API_URL}/api/product/addcart`,
        { productId, email },
        { headers }
      );
      if (data?.cart?.items) return { items: data.cart.items };
      // Older responses do not return the cart, so re-read it
      const refreshed = await dispatch(fetchCart()).unwrap();
      return refreshed;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Could not add to cart');
    }
  }
);

const mutate = (name, call) =>
  createAsyncThunk(`cart/${name}`, async (itemId, { getState, rejectWithValue }) => {
    const { headers } = authBits(getState);
    try {
      const { data } = await call(itemId, headers);
      return { items: data?.cart?.items ?? [] };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Could not update your cart');
    }
  });

export const incrementItem = mutate('increment', (id, headers) =>
  axios.post(`${API_URL}/api/product/increment/${id}`, {}, { headers })
);

export const decrementItem = mutate('decrement', (id, headers) =>
  axios.post(`${API_URL}/api/product/decrement/${id}`, {}, { headers })
);

export const removeItem = mutate('remove', (id, headers) =>
  axios.delete(`${API_URL}/api/product/remove/${id}`, { headers })
);

const initialState = {
  items: [],
  status: 'idle', // idle | loading | ready | failed
  error: null,
};

const applyItems = (state, action) => {
  state.items = action.payload.items;
  state.status = 'ready';
  state.error = null;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    cartCleared(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, applyItems)
      .addCase(addItem.fulfilled, applyItems)
      .addCase(incrementItem.fulfilled, applyItems)
      .addCase(decrementItem.fulfilled, applyItems)
      .addCase(removeItem.fulfilled, applyItems)
      .addMatcher(
        (action) => action.type.startsWith('cart/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload || 'Something went wrong with your cart';
        }
      );
  },
});

export const { cartCleared } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartStatus = (state) => state.cart.status;
export const selectCartError = (state) => state.cart.error;

export const selectCartCount = createSelector([selectCartItems], (items) =>
  items.reduce((n, item) => n + (item.quantity || 1), 0)
);

export const selectCartSubtotal = createSelector([selectCartItems], (items) =>
  items.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 1), 0)
);

export default cartSlice.reducer;
