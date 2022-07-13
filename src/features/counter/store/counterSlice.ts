import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../common/store/store";

export interface CounterState {
  value: number;
  status: "idle" | "loading" | "failed";
}

const initialState: CounterState = {
  value: 0,
  status: "idle",
};

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    incrementAsync: (state) => {
      state.status = "loading";
    },
    incrementAsyncSuccess: (state) => {
      state.status = "idle";
      state.value += 1;
    },
    incrementAsyncError: (state) => {
      state.status = "failed";
    },
    incrementAsync2: (state, action) => {
      state.status = "loading";
    },
    incrementAsyncSuccess2: (state, action) => {
      state.status = "idle";
      state.value += 1;
    },
    incrementAsyncError2: (state, action) => {
      state.status = "failed";
    },
  },
});

// It looks like ofType operator has problems with correcly infering types.
// 1 - If any slice has any action that does not use its second argument `action` like for example `incrementAsync` action then in epic when using ofType and destructuring payload from e.g. switchMap() you will get an typescript error that payload does not exist / is undeifned even thou its not the truth
// 2 - if there is any action that uses its 2nd argument called `action` like e.g. `incrementAsync2` then when you will try to destructure keys from `payload` in `switchMap` (or any other operator) you won't get any error but those members of payload (if payload is an object) will be of type `any`.

const actions = counterSlice.actions;
export { actions as CounterSliceAllActions };

export const { incrementByAmount, incrementAsync } = counterSlice.actions;

export const selectCount = (state: RootState) => state.counter.value;

export default counterSlice.reducer;
