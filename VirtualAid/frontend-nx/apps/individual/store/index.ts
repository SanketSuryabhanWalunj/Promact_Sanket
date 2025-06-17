import { configureStore } from '@reduxjs/toolkit';

import CartReducer from './apps/cart';

const store = configureStore({
  reducer: {
    cart: CartReducer,
  },

});

export default store;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
