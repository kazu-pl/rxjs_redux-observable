import { of } from "rxjs";
import { catchError, switchMap, map, tap } from "rxjs/operators";
import { ajax, AjaxError } from "rxjs/ajax";
import { Epic, ofType, combineEpics } from "redux-observable";

import { RootState } from "common/store/rootReducer";
import { FetchAllPokemonsResponse } from "types/api.types";

import { PokemonSliceAllActions } from "./pokemonSlice";

const { fetchPokemons, fetchPokemonsError, fetchPokemonsSuccess } = PokemonSliceAllActions;
const { fetchSomethingElse, fetchSomethingElseSuccess, fetchSomethingElseError } = PokemonSliceAllActions;

type FetchAllStart = ReturnType<typeof fetchPokemons>;
type FetchAll = FetchAllStart | ReturnType<typeof fetchPokemonsError> | ReturnType<typeof fetchPokemonsSuccess>;
// the first argument for Epic should be ReturnType<typeof fetchPokemons> type because I allow only that action to pass down in this epic by typing  ofType(fetchPokemons.type) but the epic is typed that the second argument must extend the first one which is a mistake? that's why I type both arguments with the same type
const fetchAllPokemonsEpic: Epic<FetchAll, FetchAll, RootState> = (action$, state$) =>
  action$.pipe(
    tap((action: any) => console.log({ action, epic: "pokemon" })), // here any action, even the ones that this epic does not use goes and can be catched

    // in  redux-observable 1.2.0 you had to pass FetchAll as 1st argument and `FetchAllStart` type as 2nd argument for ofType instead of FetchAllStart['type']
    ofType<FetchAllStart, FetchAllStart["type"]>(fetchPokemons.type),
    tap((action) => console.log({ action, epic: "pokemon-inside" })), // here only fetchPokemons action passed
    switchMap(({ payload: { page, pageSize, sortBy, sortDirection } }) => {
      console.log({
        page,
        pageSize,
        sortBy,
        sortDirection,
      });
      return ajax.get<FetchAllPokemonsResponse>("https://pokeapi.co/api/v2/pokemon").pipe(
        // you don 't have to create observable from fetchPokemonsSuccess becasue its inside of switchMap which returns ajax observable, and fetchPokemons is inside of that ajax. So everything works correctly.
        map((res) => fetchPokemonsSuccess(res.response)),
        catchError((error: AjaxError) => {
          console.log({ error, epic: "pokemon" });
          return of(fetchPokemonsError(error));
        })
      );
    })
  );

type FetchSomethingElseStart = ReturnType<typeof fetchSomethingElse>;
type FetchSomethingElse =
  | FetchSomethingElseStart
  | ReturnType<typeof fetchSomethingElseSuccess>
  | ReturnType<typeof fetchSomethingElseError>;
const fetchSomethingElseEpic: Epic<FetchSomethingElse, FetchSomethingElse, RootState> = (action$) =>
  action$.pipe(
    ofType<FetchSomethingElseStart, FetchSomethingElseStart["type"]>(fetchSomethingElse.type),
    switchMap(() => {
      // here I posted the same link just to do some async task, it has nothing to do with fetchSomethingElse action
      return ajax.get<FetchAllPokemonsResponse>("https://pokeapi.co/api/v2/pokemon").pipe(
        map((res) => fetchSomethingElseSuccess({ data: [], totalPages: 0 })),
        catchError((error: AjaxError) => {
          return of(fetchSomethingElseError({ status: error.status, message: error.message }));
        })
      );
    })
  );

const pokemonEpic = combineEpics(
  fetchAllPokemonsEpic,
  fetchSomethingElseEpic
  // other epics for particualr action
);

export default pokemonEpic;

export type PokemonEpic = FetchAll | FetchSomethingElse;

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
type PokemonEpic3 = ReturnType<T[keyof T]>;
// type ReturnType<T[keyof T]> creates literal union of returned types from all functions in object of type T. More info in README.md
