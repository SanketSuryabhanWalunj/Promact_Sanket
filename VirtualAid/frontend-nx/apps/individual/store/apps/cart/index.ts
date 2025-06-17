import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { current } from 'immer';

import { CartItemType, CartSliceInitialState } from '../../../types/cart';
import axios, { AxiosResponse } from 'axios';

type addItemInCartType = {
  companyId?: string;
  userId?: string;
  courseId: string;
  courseCount: number;
  examType: string;
};

type itemForPaymentType = {
  userId?: string;
  companysId?: string;
  courseId: string;
  examType: string;
  totalCount: number;
  remainingCount: number;
  payementId: string;
  purchasedDate: string;
};

const initialState: CartSliceInitialState = {
  loading: false,
  data: {
    items: [],
    totalQty: 0,
    totalAmount: 0,
  },
  error: '',
};

const calculateTotalQty = (items: CartItemType[]) => {
  const totalQty = items.reduce((accumulator, currentItem) => {
    return accumulator + currentItem.courseCount;
  }, 0);

  return totalQty;
};

const calculateTotalAmount = (items: CartItemType[]) => {
  const totalAmount = items.reduce((accumulator, currentItem) => {
    return (
      accumulator + currentItem.courseCount * currentItem.courseDetails.price
     
    );
  }, 0);

  return totalAmount;
};


export const fetchCompanyCart = createAsyncThunk(
  'cart/fetchCompanyCartanyCartanyCartanyCart',
  async (getReqData: { companyId: string }) => {
    const { companyId } = getReqData;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/cart/carts-by-company-id/${companyId}`
    );

    return response.data;
  }
);

export const fetchUserCart = createAsyncThunk(
  'cart/fetchUserCart',
  async (gerReqData: { userId: string }) => {
    const { userId } = gerReqData;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/cart/carts-by-user-id/${userId}`
    );
    
    return response.data;
  }
);



export const addItemInCart = createAsyncThunk(
  'cart/addItemInCart',
  async (postReqData: addItemInCartType) => {
    const { companyId, userId, courseId, courseCount, examType } = postReqData;
    const dataToSend = {
      companyId,
      userId,
      courseId,
      courseCount,
      examType,
    };
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/cart/course-in-cart`,
      dataToSend
    );
  
    return response.data;

  }
);

export const removeItemFromCart = createAsyncThunk(
  'cart/removeItemFromCart',
  async (deleteReqData: { cartId: string }) => {
    const { cartId } = deleteReqData;

    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/app/cart/cart-by-id/${cartId}`
    );

    return { data: response.data, cartId };
  }
);

export const payment = createAsyncThunk(
  'cart/payment',
  async (paymentReqData: {
    items: itemForPaymentType[];
    buyerId: string;
    isCompany: boolean;
  }): Promise<{ data: AxiosResponse; isCompany: boolean }> => {
    const { items, buyerId, isCompany } = paymentReqData;

    const response = await axios.post(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL
      }/api/app/course/subscribe-bulk-courses/${buyerId}?isCompany=${
        isCompany ? 'true' : 'false'
      }`,
      items
    );

    return { data: response, isCompany };
  }
);

export const cartSlice = createSlice({
  name: 'cart',
  initialState: initialState,
  reducers: {
    emptyCart: (state) => {
      state.error = '';
      state.loading = false;
      state.data.items = [];
      state.data.totalAmount = 0;
      state.data.totalQty = 0;
    },
  },
  extraReducers: (builder) => {
    /* 
      Add / Modify item in cart action: addItemInCart
    */
    // addItemInCart pending
    builder.addCase(addItemInCart.pending, (state) => {
      state.loading = true;
    });
    // addItemInCart fulfilled
    builder.addCase(addItemInCart.fulfilled, (state, action) => {
      state.loading = false;
      const currentCartItems = current(state.data.items);
      const indexToUpdate = currentCartItems.findIndex(
        (item) =>
          item.courseId === action.payload.courseId &&
          item.examType === action.payload.examType
      );
      const updatedCartItems = [...currentCartItems];
      if (indexToUpdate >= 0) {
        updatedCartItems[indexToUpdate] = action.payload;
      } else {
        updatedCartItems.push(action.payload);
      }
      state.data.items = updatedCartItems;
      state.data.totalQty = calculateTotalQty(updatedCartItems);
      state.data.totalAmount = calculateTotalAmount(updatedCartItems);
    });
   
    builder.addCase(addItemInCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message as string;
    });

    /* 
      Fetch cart items action for company: fetchCompanyCart
    */
    // fetchCompanyCart pending
    builder.addCase(fetchCompanyCart.pending, (state) => {
      state.loading = true;
    });
    // fetchCompanyCart fulfilled
    builder.addCase(fetchCompanyCart.fulfilled, (state, action) => {
      state.loading = false;
      state.data.items = action.payload;
      state.error = '';

      const currentCartItems = action.payload;
      state.data.totalQty = calculateTotalQty(currentCartItems);
      state.data.totalAmount = calculateTotalAmount(currentCartItems);
    });
    // fetchCompanyCart rejected
    builder.addCase(fetchCompanyCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message as string;
    });

    /* 
      Fetch cart items action for user: fetchUserCart
    */
    // fetchUserCart pending
    builder.addCase(fetchUserCart.pending, (state) => {
      state.loading = true;
    });
    // fetchUserCart fulfilled
    builder.addCase(fetchUserCart.fulfilled, (state, action) => {
      state.loading = false;
      state.data.items = action.payload;
      state.error = '';

      const currentCartItems = action.payload;
      state.data.totalQty = calculateTotalQty(currentCartItems);
      state.data.totalAmount = calculateTotalAmount(currentCartItems);
    });
    // fetchUserCart rejected
    builder.addCase(fetchUserCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message as string;
    });

    /* 
      Remove item from cart action: removeItemFromCart
    */
    // removeItemFromCart pending
    builder.addCase(removeItemFromCart.pending, (state) => {
      state.loading = true;
    });
    // removeItemFromCart fulfilled
    builder.addCase(removeItemFromCart.fulfilled, (state, action) => {
      state.loading = false;
      const removeItemCartId = action.payload.cartId;
      const currentCartItems = current(state.data.items);
      const updatedCartItems = currentCartItems.filter(
        (item) => item.id !== removeItemCartId //if required
      );
      state.data.items = updatedCartItems;
      state.data.totalQty = calculateTotalQty(updatedCartItems);
      state.data.totalAmount = calculateTotalAmount(updatedCartItems);
    });
    // removeItemFromCart rejected
    builder.addCase(removeItemFromCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message as string;
    });

    /* 
      Payment action: payment
    */
    // payment pending
    builder.addCase(payment.pending, (state) => {
      state.loading = true;
    });
    // payment fulfilled
    builder.addCase(payment.fulfilled, (state, action) => {
      state.loading = false;
      state.data.items = [];
      state.data.totalAmount = 0;
      state.data.totalQty = 0;
      // if (action.payload.isCompany) {
      //   window.location.href = '/company/purchased-courses';
      // } else {
      //   window.location.href = '/user/my-courses';
      // }
    });
    // payment rejected
    builder.addCase(payment.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.error.message as string) || 'Something went wrong';
    });
  },
});

export const { emptyCart } = cartSlice.actions;

export default cartSlice.reducer;
