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
    incrementAsyncError: (state, action) => {
      state.status = "failed";
    },
  },
});

const actions = counterSlice.actions;
export { actions as CounterSliceAllActions };

export const { incrementByAmount, incrementAsync } = counterSlice.actions;

export const selectCount = (state: RootState) => state.counter.value;

export default counterSlice.reducer;
