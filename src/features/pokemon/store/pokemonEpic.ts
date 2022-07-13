import { of } from "rxjs";
import { catchError, switchMap, map, filter, tap } from "rxjs/operators";
import { ajax, AjaxError } from "rxjs/ajax";
import { combineEpics } from "redux-observable";
// import { ofType } from "redux-observable";

import { FetchAllPokemonsResponse, FetchSinglePokemonResponse } from "types/api.types";

import { PokemonSliceAllActions } from "./pokemonSlice";
import { ReduxObservableEpic } from "types/redux-observable.types";

const { fetchPokemons, fetchPokemonsError, fetchPokemonsSuccess } = PokemonSliceAllActions;
const { fetchSinglePokemonStart, fetchSinglePokemonSuccess, fetchSinglePokemonError } = PokemonSliceAllActions;

// type FetchAllStart = ReturnType<typeof fetchPokemons>;
// type FetchAll = FetchAllStart | ReturnType<typeof fetchPokemonsError> | ReturnType<typeof fetchPokemonsSuccess>;

//// the first argument for Epic should be ReturnType<typeof fetchPokemons> type because I allow only that action to pass down in this epic by typing  ofType(fetchPokemons.type) but the epic is typed that the second argument must extend the first one which is a mistake? that's why I type both arguments with the same type
const fetchAllPokemonsEpic: ReduxObservableEpic = (action$, state$) =>
  action$.pipe(
    tap((action) => console.log({ action, epic: "pokemon - before filter()" })), // here any action, even the ones that this epic does not use goes and can be catched

    //// in  redux-observable 1.2.0 you had to pass FetchAll as 1st argument and `FetchAllStart` type as 2nd argument for ofType instead of FetchAllStart['type']
    // ofType<RootEpicAction, FetchAllStart["type"]>(fetchPokemons.type),
    filter(fetchPokemons.match),
    switchMap(({ payload: { page, pageSize, sortBy, sortDirection } }) => {
      return ajax.get<FetchAllPokemonsResponse>("https://pokeapi.co/api/v2/pokemon").pipe(
        // you don't have to create observable from fetchPokemonsSuccess becasue its inside of switchMap which returns ajax observable, and fetchPokemons is inside of that ajax. So everything works correctly.
        map((res) => fetchPokemonsSuccess(res.response)),
        catchError((error: AjaxError) => {
          console.log({ error, epic: "pokemon" });
          return of(fetchPokemonsError(error));
        })
      );
    })
  );

// type FetchSomethingElseStart = ReturnType<typeof fetchSinglePokemonStart>;
// type FetchSomethingElse =
//   | FetchSomethingElseStart
//   | ReturnType<typeof fetchSinglePokemonSuccess>
//   | ReturnType<typeof fetchSinglePokemonError>;
const fetchSinglePokemonEpic: ReduxObservableEpic = (action$) =>
  action$.pipe(
    // tap((action: any) => console.log({ action, epic: "pokemon" })), // here any action, even the ones that this epic does not use goes and can be catched
    // ofType<RootEpicAction, FetchSomethingElseStart["type"]>(fetchSinglePokemonStart.type),
    filter(fetchSinglePokemonStart.match), // you can use filter() instead of ofType()
    switchMap(({ payload: { pokemonName = "ditto" } }) => {
      return ajax.get<FetchSinglePokemonResponse>(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`).pipe(
        map((res) => fetchSinglePokemonSuccess(res.response)),
        catchError((error: AjaxError) => {
          return of(fetchSinglePokemonError({ status: error.status, message: error.message }));
        })
      );
    })
  );

const pokemonEpic = combineEpics(
  fetchAllPokemonsEpic,
  fetchSinglePokemonEpic
  // other epics for particualr action
);

export default pokemonEpic;

// export type PokemonEpic = FetchAll | FetchSomethingElse;

//// #####################################################################################
//// #####################################################################################
//// ABOVE TYPE (type PokemonEpic)  CAN BE ALSO DESCRIBED AS:

// ##### 1 #####:
// (instead of PokemonsSliceAllActions you way want to use All actions USED BY Redux-Observable, because right now ALL actions include also updateFetchParams action (because you just export the whole actions object of slice) but that action does not go through redux-observable), right now it does not do anything bad but it would be good to not export its type here as it will never go through redux-observable
type PokemonEpic2 = ReturnType<typeof PokemonSliceAllActions[keyof typeof PokemonSliceAllActions]>;

//// OR:

// #### 2 #####:
// (instead of PokemonsSliceAllActions you way want to use All actions USED BY Redux-Observable, because right now ALL actions include also updateFetchParams action (because you just export the whole actions object of slice) but that action does not go through redux-observable), right now it does not do anything bad but it would be good to not export its type here as it will never go through redux-observable
type T = typeof PokemonSliceAllActions;
export type PokemonEpic = ReturnType<T[keyof T]>;
// type ReturnType<T[keyof T]> creates literal union of returned types from all functions in object of type T. More info in README.md
