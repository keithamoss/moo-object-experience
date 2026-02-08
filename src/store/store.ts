import { configureStore } from '@reduxjs/toolkit';
import { sheetsApi } from './api';
import searchReducer from './searchSlice';

export const store = configureStore({
  reducer: {
    [sheetsApi.reducerPath]: sheetsApi.reducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sheetsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
