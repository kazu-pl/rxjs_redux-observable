import { of } from "rxjs";
import { catchError, switchMap, map, tap } from "rxjs/operators";
import { ajax, AjaxError } from "rxjs/ajax";
import { Epic, ofType, combineEpics } from "redux-observable";

import { RootState } from "common/store/rootReducer";
import { FetchAllPokemonsResponse } from "types/api.types";

import { PokemonSliceAllActions } from "./pokemonSlice";

const { fetchAllPolemons, fetchAllPolemonsError, fetchAllPolemonsSuccess } = PokemonSliceAllActions;
const { fetchSomethingElse, fetchSomethingElseSuccess, fetchSomethingElseError } = PokemonSliceAllActions;

type FetchAll =
  | ReturnType<typeof fetchAllPolemons>
  | ReturnType<typeof fetchAllPolemonsError>
  | ReturnType<typeof fetchAllPolemonsSuccess>;
// the first argument for Epic should be ReturnType<typeof fetchAllPolemons> type because I allow only that action to pass down in this epic by typing  ofType(fetchAllPolemons.type) but the epic is typed that the second argument must extend the first one which is a mistake? that's why I type both arguments with the same type
const fetchAllPokemonsEpic: Epic<FetchAll, FetchAll, RootState> = (action$, state$) =>
  action$.pipe(
    tap((action: any) => console.log({ action, epic: "pokemon" })), // here any action, even the ones that this epic does not use goes and can be catched
    ofType(fetchAllPolemons.type),
    tap((action) => console.log({ action, epic: "pokemon-inside" })), // here only fetchAllPolemons action passed
    switchMap(() => {
      return ajax.get<FetchAllPokemonsResponse>("https://pokeapi.co/api/v2/pokemon").pipe(
        // you don 't have to create observable from fetchAllPolemonsSuccess becasue its inside of switchMap which returns ajax observable, and fetchAllPolemons is inside of that ajax. So everything works correctly.
        map((res) => fetchAllPolemonsSuccess(res.response)),
        catchError((error: AjaxError) => {
          console.log({ error, epic: "pokemon" });
          return of(fetchAllPolemonsError(error));
        })
      );
    })
  );

type FetchSomethingElse =
  | ReturnType<typeof fetchSomethingElse>
  | ReturnType<typeof fetchSomethingElseSuccess>
  | ReturnType<typeof fetchSomethingElseError>;
const fetchSomethingElseEpic: Epic<FetchSomethingElse, FetchSomethingElse, RootState> = (action$) =>
  action$.pipe(
    ofType(fetchSomethingElse.type),
    switchMap(() => {
      // here I posted the same link just to do some async task, it has nothing to do with fetchSomethingElse action
      return ajax.get<FetchAllPokemonsResponse>("https://pokeapi.co/api/v2/pokemon").pipe(
        map((res) => fetchSomethingElseSuccess({ data: [], totalPages: 0 })),
        catchError((error: AjaxError) => {
          return of(fetchSomethingElseError());
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

// 1#:
type PokemonEpic2 = ReturnType<typeof PokemonSliceAllActions[keyof typeof PokemonSliceAllActions]>;

//// OR:

// 2#:
type T = typeof PokemonSliceAllActions;
type PokemonEpic3 = ReturnType<T[keyof T]>;
// type ReturnType<T[keyof T]> creates literal union of returned types from all functions in object of type T. More info in README.md
