import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import rootReducer, { RootState } from "./rootReducer";
import rootEpic, { epicMiddleware } from "./rootEpic";
import { Middleware } from "@reduxjs/toolkit";

const throwMiddleware: Middleware = () => (next) => (action) => {
  next(action);
  if (action?.error) {
    throw action.payload;
  }
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => [...getDefaultMiddleware({ thunk: false }), throwMiddleware, epicMiddleware],
  devTools: process.env.NODE_ENV !== "production",
});

epicMiddleware.run(rootEpic);

export default store;
export type AppDispatch = typeof store.dispatch;
export type { RootState } from "./rootReducer";
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
