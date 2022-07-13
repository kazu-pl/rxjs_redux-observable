import { catchError, map, mergeMap, of, tap, from, filter } from "rxjs";
import { combineEpics } from "redux-observable";
// import { ofType } from "redux-observable";

import { CounterSliceAllActions } from "./counterSlice";
import { AjaxError } from "rxjs/ajax";
import { ReduxObservableEpic } from "types/redux-observable.types";

const doAsyncWork = () =>
  // this has to be function and not just const doAsyncWork = new Promise. Otherwise only the first click would be async
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        data: "foo",
      });
    }, 3000);
  });

const { incrementAsync, incrementAsyncSuccess, incrementAsyncError } = CounterSliceAllActions;

// type IncrementAsyncStart = ReturnType<typeof incrementAsync>;
// type IncrementAsync =
//   | IncrementAsyncStart
//   | ReturnType<typeof incrementAsyncSuccess>
//   | ReturnType<typeof incrementAsyncError>;
const incrementAsyncEpic: ReduxObservableEpic = (action$, state$) =>
  action$.pipe(
    // tap((action: any) => console.log({ action, epic: "counter" })), // here goes EVERY dispatched action even from another slices etc
    // ofType<IncrementAsyncStart, IncrementAsyncStart["type"]>(incrementAsync.type), // below this line goes only the IncrementAsyncStart action
    filter(incrementAsync.match),
    tap((action) => console.log({ action, epic: "counter - after filter()" })),
    mergeMap(() => {
      return from(doAsyncWork()).pipe(
        map((res) => incrementAsyncSuccess()),
        catchError((error: AjaxError) => {
          console.log({ error, epic: "counter" });
          return of(incrementAsyncError());
        })
      );
    })
  );

const counterEpic = combineEpics(
  incrementAsyncEpic
  // other epics for particular action
);

export default counterEpic;

// export type CounterEpic = IncrementAsync; // IncrementAsync | AnyOtherEpicWhichDoesNotExistRightNow;

type T = typeof CounterSliceAllActions;
export type CounterEpic = ReturnType<T[keyof T]>;
