import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FetchAllPokemonsResponse } from "types/api.types";
import { RootState } from "common/store/store";

interface PokemonState {
  data: null | FetchAllPokemonsResponse["results"];
  isFetching: boolean;
  error: null | string;
}

const initialState: PokemonState = {
  data: null,
  isFetching: false,
  error: null,
};

const pokemonSlice = createSlice({
  name: "pokemon",
  initialState,
  reducers: {
    // standard sync action that you usually don't use in epic because there is no need for that
    resetData: (state) => {
      state.data = null;
    },
    // async action that will be handled in epic. Its the action you want to dispatch
    fetchAllPolemons(state) {
      state.isFetching = true;
    },
    // async action that will be handled in epic. YOU SHOULD BE ABLE TO DISPATCH THIS ACTION
    fetchAllPolemonsSuccess(state, action: PayloadAction<FetchAllPokemonsResponse>) {
      state.data = action.payload.results;
      state.isFetching = false;
    },
    // async action that will be handled in epic. YOU SHOULD BE ABLE TO DISPATCH THIS ACTION
    fetchAllPolemonsError(state, action) {
      state.data = null;
      state.isFetching = false;
      state.error = action.payload;
    },

    // - - - - - - - - - - - - - - - - - - - - - - - - - -
    fetchSomethingElse(_, action) {},
    fetchSomethingElseSuccess(
      state,
      action: PayloadAction<{ totalPages: number; data: { id: string; age: number }[] }>
    ) {},
    fetchSomethingElseError(state) {
      state.error = "error";
    },
  },
});

const actions = pokemonSlice.actions;
export { actions as PokemonSliceAllActions }; // you have to export ALL actions  because you need actions like fetchAllPolekomsSuccess in redux-observable even you won't dispatch it directly
// ALTERNATIVE: you can export the whole pokemonSlice (right now you exports only pokemonSlice.reducer) and import it in pokemonEpic. Right now you can't do so because you import pokemonSlice.reducer which does not have action object (its the slice itself that has it)

export const { resetData, fetchAllPolemons, fetchSomethingElse } = pokemonSlice.actions; // here you export only the actions you can dispatch. PAY ATTENITION that you don't export here actions like "fetchAllPolekomsSuccess" or "fetchSomethingElseError" because you should not be able to dispatch them anywhere. They are used only in pokemonEpic

export const selectData = (state: RootState) => state.pokemon.data;
export const selectIsFetching = (state: RootState) => state.pokemon.isFetching;

export default pokemonSlice.reducer;
