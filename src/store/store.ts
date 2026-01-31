import { configureStore } from '@reduxjs/toolkit';

// Placeholder reducer - will be replaced with actual slices
const rootReducer = {
	// Add your reducers here as you create them
};

export const store = configureStore({
	reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
