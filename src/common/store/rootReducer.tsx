import { combineReducers, AnyAction } from "@reduxjs/toolkit";
import counterReducer from "../../features/counter/store/counterSlice";
import pokemonSlice from "features/pokemon/store/pokemonSlice";

const combinedReducer = combineReducers({
  counter: counterReducer,
  pokemon: pokemonSlice,
});

export type RootState = ReturnType<typeof combinedReducer>;

const rootReducer = (rootState: RootState | undefined, action: AnyAction) => {
  if (action.type === "user/logout") {
    if (rootState) {
      rootState = undefined;
    }
  }
  return combinedReducer(rootState, action);
};

export default rootReducer;
