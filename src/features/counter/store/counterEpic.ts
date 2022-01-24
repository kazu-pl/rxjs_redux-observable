import { catchError, map, mergeMap, of, tap, from } from "rxjs";
import { Epic, ofType, combineEpics } from "redux-observable";

import { RootState } from "common/store/rootReducer";

import { CounterSliceAllActions } from "./counterSlice";
import { AjaxError } from "rxjs/ajax";

const doAsyncWork = () =>
  // this has to be function and not just const doAsyncWork = new Promise. Otherwise only the first click would be async
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("foo");
    }, 3000);
  });

const { incrementAsync, incrementAsyncSuccess, incrementAsyncError } = CounterSliceAllActions;

type IncrementAsync =
  | ReturnType<typeof incrementAsync>
  | ReturnType<typeof incrementAsyncSuccess>
  | ReturnType<typeof incrementAsyncError>;
const incrementAsyncEpic: Epic<IncrementAsync, IncrementAsync, RootState> = (action$, state$) =>
  action$.pipe(
    tap((action: any) => console.log({ action, epic: "counter" })),
    ofType(incrementAsync.type),
    tap((action) => console.log({ action, epic: "counter" })),
    mergeMap(() => {
      return from(doAsyncWork()).pipe(
        map((res) => incrementAsyncSuccess()),
        catchError((error: AjaxError) => {
          console.log({ error, epic: "counter" });
          return of(incrementAsyncError("error occured"));
        })
      );
    })
  );

const counterEpic = combineEpics(
  incrementAsyncEpic
  // other epics for particualr action
);

export default counterEpic;

export type CounterEpic = IncrementAsync; // IncrementAsync | AnyOtherEpicWhichDoesNotExistRightNow;
