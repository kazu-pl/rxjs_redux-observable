import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FetchAllPokemonsResponse, FetchSinglePokemonResponse } from "types/api.types";
import { RootState } from "common/store/store";

interface FetchError {
  status: number;
  message: string;
}

interface Filters {
  page: number;
  pageSize: number;
  sortBy: string;
  sortDirection: "asc" | "dsc";
  search: string | null;
}

interface PokemonState {
  data: null | FetchAllPokemonsResponse["results"];
  isFetching: boolean;
  error: null | FetchError;
  filters: Filters;
  singlePokemon: {
    data: FetchSinglePokemonResponse | null;
    isFetching: boolean;
    error: null | FetchError;
  };
}

const initialState: PokemonState = {
  data: null,
  isFetching: false,
  error: null,
  filters: {
    page: 1,
    pageSize: 10,
    sortBy: "createdAt",
    sortDirection: "asc",
    search: null,
  },
  singlePokemon: {
    data: null,
    isFetching: true,
    error: null,
  },
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
    fetchPokemons(state, action: PayloadAction<Filters>) {
      state.isFetching = true;
    },
    // async action that will be handled in epic. YOU SHOULD BE ABLE TO DISPATCH THIS ACTION
    fetchPokemonsSuccess(state, action: PayloadAction<FetchAllPokemonsResponse>) {
      state.data = action.payload.results;
      state.isFetching = false;
    },
    // async action that will be handled in epic. YOU SHOULD BE ABLE TO DISPATCH THIS ACTION
    fetchPokemonsError(state, action: PayloadAction<FetchError>) {
      state.data = null;
      state.isFetching = false;
      state.error = action.payload;
    },

    updateFetchParams(state, action: PayloadAction<Partial<Filters>>) {
      // if (action.payload.page) {
      //   state.filters.page = action.payload.page;
      // }
      // if (action.payload.pageSize) {
      //   state.filters.pageSize = action.payload.pageSize;
      // }
      // if (action.payload.sortBy) {
      //   state.filters.sortBy = action.payload.sortBy;
      // }
      // if (action.payload.sortDirection) {
      //   state.filters.sortDirection = action.payload.sortDirection;
      // }
      // if (action.payload.search) {
      //   state.filters.search = action.payload.search;
      // }

      // Instead of writing if() for every filter (like above) you can just create code that will automatically update filters like is shown below:
      //
      /**
       * newFilters is an Array of arrays with filters passed to this action
       * @example
       * const newfilters = [ ["page", 1], ["size", 10] ]
       */
      const newfilters = Object.entries(action.payload);

      newfilters.forEach((newFilterArray) => {
        if (typeof newFilterArray[0] === "string") {
          // @ts-ignore
          state.filters[newFilterArray[0]] = newFilterArray[1];
        }
      });
    },

    // - - - - - - - - - - - - - - - - - - - - - - - - - -
    fetchSinglePokemonStart(state, action: PayloadAction<{ pokemonName: string }>) {
      state.singlePokemon.isFetching = true;
    },
    fetchSinglePokemonSuccess(state, action: PayloadAction<FetchSinglePokemonResponse>) {
      state.singlePokemon.isFetching = false;
      state.singlePokemon.data = action.payload;
    },
    fetchSinglePokemonError(state, acttion: PayloadAction<FetchError>) {
      state.error = acttion.payload;
      state.singlePokemon.isFetching = false;
    },
  },
});

const actions = pokemonSlice.actions;
// here you export ALL aactions including updateFetchParams action but that action does not go throught redux-observable
export { actions as PokemonSliceAllActions }; // you have to export ALL actions  because you need actions like fetchAllPolekomsSuccess in redux-observable even you won't dispatch it directly
// ALTERNATIVE: you can export the whole pokemonSlice (right now you exports only pokemonSlice.reducer) and import it in pokemonEpic. Right now you can't do so because you import pokemonSlice.reducer which does not have action object (its the slice itself that has it)

export const { resetData, fetchPokemons, fetchSinglePokemonStart, updateFetchParams } = pokemonSlice.actions; // here you export only the actions you can dispatch. PAY ATTENITION that you don't export here actions like "fetchAllPolekomsSuccess" or "fetchSomethingElseError" because you should not be able to dispatch them anywhere. They are used only in pokemonEpic

export const selectData = (state: RootState) => state.pokemon.data;
export const selectIsFetching = (state: RootState) => state.pokemon.isFetching;
export const selectIsFetchingSinglePokemon = (state: RootState) => state.pokemon.singlePokemon.isFetching;
export const selectSinglePokemon = (state: RootState) => state.pokemon.singlePokemon.data;

export default pokemonSlice.reducer;
