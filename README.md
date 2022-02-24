# Return two or more actions in epic when the initial action is completed:

```tsx
import { AnyAction } from "redux";

const updateRequest = (id: number) => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res(id);
    }, 5000);
  });
};

interface AnyActionWithPayload extends AnyAction {
  payload: any;
}

type UpdateSomethingIn = ReturnType<typeof updateSomething>;

const updateSomethingEpic: Epic<UpdateSomethingIn, AnyActionWithPayload, RootState> = (action$) =>
  action$.pipe(
    ofType(updateSomething.type),
    switchMap((action) => {
      const id = action.payload.id;
      // return ajax.put(`https://myApi.com/api/posts/${id}`) // <--- in real world example it would some reuest, not promise
      return from(updateRequest(id)).pipe(
        // you just need to use mergeMap
        mergeMap((res) => {
          return from([updateSomethingSuccess(), fetchSomethingStart(id)]); // and use from to make observable that returns 2 actions
        }),
        catchError((error: AjaxError) => {
          return of(fetchSomethingElseError());
        })
      );
    })
  );
```

# type `T[keyof T]` and `ReturnType<t[keyof T]>`:

### type `T[keyof T]`

It is a literal union type of all function types of object of type T.

EXAMPLE:

1 - Let's suppose you have some object type like below:

```tsx
interface MyObject {
  getName: (name?: string) => name | "no name";
  setAge: (age: number) => void;
}
```

2 - now to get type of particular function you can do something like that:

```tsx
type GetNAme = MyObject["getName"]; // this type will be : (name?: string) => string;
```

3 - Now its important to know that `keyof` makes literal union of keys of some object, so:

```tsx
type MyObjectKeys = keyof MyObject; // this type will be: "getNAme" | "setAge"
```

4 - so if you want to get literal union of types of all functions in some object you can do something hardcoded like this:

```tsx
type MyObjectFunctions = MyObject["getName" | "setAge"]; // its hardcoded  - its not the best idea to hard code things
```

5 - or you can simply write more universal type like so:

```tsx
type AllFunctionTypes = MyObject[keyof MyObject]; // now this type is: ((name?: string) => string) | ((age: number) => void)
```

above code is just example of T[keyof T] type.

### type `ReturnType<T[keyof T]>`:

This type is a literal union of returned types from all functions in T object.

So if you have:

```tsx
interface MyObject {
  getName: (name?: string) => name | "no name"; // type of this function: (name?: string)=> string
  setAge: (age: number) => void; // type of  this function: (age: number) => void
}
```

then it will be `string | void`;

Why? Because `ReturnType` can get as an argument both: type of function or literal union of some functions. If literal union of functions were passed then ReturnType will be also literal union of all returned types from all of those functions;

---

# how to type function by using interface

```tsx
export interface ActionCreatorFromRedux<A> {
  (...args: number[]): A;
}
```

Note that in above example its function directl y: `(...args: number[]): A`. It's not object member like: `someFunction: (..args: number[]) => A`

Above interface describes function type. The function receives endless list on numbers and returns some generic type. You can use that function like below:

```tsx
// here args will be array of all args so it will be of type number[]
const functionWithRestedArgs: ActionCreatorFromRedux<string> = (...args) => {
  return "some string";
};

// here you can just use particular arg. Each arg will be of type nmber
const functionWihEachArgSeparate: ActionCreatorFromRedux<string> = (arg1, arg2, arg3) => {
  return "some string";
};
```

# failing type of rxjs module when `yarn start` and info about installing `@types/rxjs` or ` declare module 'rxjs'`:

If you have all types typed correctly in VSC but you see warnings when `yarn start` telling you that typescript can not find type declarations for module `rxjs` then it means your typescript dependency is outdated.
To fix this you simply run:

`yarn remove typescript`

to remove previous typescript version and then you just need to add it again to install the latest version:

`yarn add typescript`

Now you should not see any warnings about types.

# Error about payload undefined

If you got error like below:

```
// src/common/store/rootEpic.ts


Argument of type 'Epic<FetchAll, FetchAll, CombinedState<{ counter: CounterState; pokemon: PokemonState; }>, any>' is not assignable to parameter of type 'Epic<{ payload: undefined; type: string; }, { payload: undefined; type: string; }, CombinedState<{ counter: CounterState; pokemon: PokemonState; }>, any>'.
  Type 'FetchAll' is not assignable to type '{ payload: undefined; type: string; }'.
    Type '{ payload: FetchAllPokemonsResponse; type: string; }' is not assignable to type '{ payload: undefined; type: string; }'.
      Types of property 'payload' are incompatible.
        Type 'FetchAllPokemonsResponse' is not assignable to type 'undefined'.

```

then it means that one of your epics handles async actions that does not have any action argument (the 2nd argument in its slice) but the other epics have.

example:

```ts
// src/features/counter/store/counterSlice.ts

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    incrementAsync: (state) => {
      // there is no action arugment like (state, action) => {
      state.status = "loading";
    },
    incrementAsyncSuccess: (state) => {
      // there is no action arugment like (state, action) => {
      state.status = "idle";
      state.value += 1;
    },
    incrementAsyncError: (state) => {
      // there is no action arugment like (state, action) => {
      state.status = "failed";
    },
  },
});
```

Because none of above actions has `action` argument their whole type is:

```ts
interface SomeActionWithoutActionArgument {
  payload: undefined; // pay attention here; payload is undefined
  type: string;
}
```

Above type can be found here:

```ts
// src/features/counter/store/counterEpic.ts

import { CounterSliceAllActions } from "./counterSlice";

const { incrementAsync, incrementAsyncSuccess, incrementAsyncError } = CounterSliceAllActions;

type IncrementAsync =
  | ReturnType<typeof incrementAsync>
  | ReturnType<typeof incrementAsyncSuccess>
  | ReturnType<typeof incrementAsyncError>;

// its the type of IncrementAsync
```

While on the other hand, `pokemonSlice` has actions and some of them has `action` argument:

```ts
// src/features/pokemon/store/pokemonSlice.ts

export const pokemonSlice = createSlice({
  name: "pokemon",
  initialState,
  reducers: {
    resetData: (state) => {
      state.data = null;
    },
    fetchAllPolemons(state) {
      state.isFetching = true;
    },
    fetchAllPolemonsSuccess(state, action: PayloadAction<FetchAllPokemonsResponse>) {
      // has `action` argument
      state.data = action.payload.results;
      state.isFetching = false;
    },
    fetchAllPolemonsError(state, action) {
      // // has `action` argument
      state.data = null;
      state.isFetching = false;
      state.error = action.payload;
    },
  },
});
```

Because some of above actions has `action` argument, the type of their type is:

```ts
type FetchAll =
  | {
      // type of fetchAllPolemonsError
      payload: any;
      type: string;
    }
  | {
      // type of fetchAllPolemonsSuccess
      payload: FetchAllPokemonsResponse;
      type: string;
    }
  | {
      // type of fetchAllPolemons
      payload: undefined;
      type: string;
    };
```

Below this comes from:

```ts
// src/features/counter/store/pokemonEpic.ts
import { PokemonSliceAllActions } from "./pokemonSlice";

const { fetchAllPolemons, fetchAllPolemonsError, fetchAllPolemonsSuccess } = PokemonSliceAllActions;

type FetchAll =
  | ReturnType<typeof fetchAllPolemons>
  | ReturnType<typeof fetchAllPolemonsError>
  | ReturnType<typeof fetchAllPolemonsSuccess>;
// its the type of FetchAll
```

So to fix this you just need to pass empty `action` argument to one of actions from slice that does not have any action with `action` argument. It's the `counterslice` slice:

```ts
export const counterSlice = createSlice({
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
    // you can add it here. but keep in mind that once you pass here action argument, you will need to pass it when dispatching that action
    incrementAsyncError: (state, action) => {
      state.status = "failed";
      // state.error = action.payload // you can also use that action argument to save `error occured` text in store
    },
  },
});
```

then you would need to pass some action argument while dispatching that action:

```ts
const incrementAsyncEpic: Epic<IncrementAsync, IncrementAsync, RootState> = (action$, state$) =>
  action$.pipe(
    ofType(incrementAsync.type),
    mergeMap(() => {
      return ajax.get("https://pokeapi.co/api/v2/pokemon").pipe(
        map((res) => incrementAsyncSuccess()),
        catchError((error) => {
          return of(incrementAsyncError("error occured")); // here you need to pass something
        })
      );
    })
  );
```

# how to type actions as AnyAction where there is warning about payload undefind and you can't use action argument in slice like shown above:

Sometimes you may create an epic for a particular slice and any action from that slice does not need any `action` argument. In that case the whole tpye for that slice will have `payload` as undefined. In that case you can't add `action` argument because you don't need that. So to create proper type and silce typescript warnings you can create epic input type as AnyAction from redux/toolkit.

EXAMPLE:

```tsx
// file of any epic

import { AnyAction } from "@reduxjs/toolkit"; // is this type as input type for epics

const { incrementAsync, incrementAsyncSuccess, incrementAsyncError } = CounterSliceAllActions;

type IncrementAsyncOut = ReturnType<typeof incrementAsyncSuccess> | ReturnType<typeof incrementAsyncError>;

// here you can type incoming actions as AnyAction because any epic receives all actions, it passes down only some of them but it always receives all actions even from another epics
const incrementAsyncEpic: Epic<AnyAction, IncrementAsyncOut, RootState> = (action$, state$) =>
  action$.pipe(
    ofType(incrementAsync.type),
    mergeMap(() => {
      return from(doAsyncWork()).pipe(
        map((res) => incrementAsyncSuccess()),
        catchError((error: AjaxError) => {
          return of(incrementAsyncError("error occured"));
        })
      );
    })
  );

const counterEpic = combineEpics(incrementAsyncEpic);

export default counterEpic;

// here you don't export any type of this epic because it type is AnyAction anyways
```

Now `rootEpic.tsx` will also need to use that `AnyAction` type like below:

```tsx
// src/common/store/rootEpic.tsx

import { combineEpics } from "redux-observable";
import { createEpicMiddleware } from "redux-observable";
import { RootState } from "./rootReducer";

import { AnyAction } from "@reduxjs/toolkit";

import counterEpic from "features/counter/store/counterEpic"; // import counterEpic, { CounterEpic } from "features/counter/store/counterEpic";
import pokemonEpic from "features/pokemon/store/pokemonEpic"; // import pokemonEpic, { PokemonEpic } from "features/pokemon/store/pokemonEpic";

const rootEpic = combineEpics(counterEpic, pokemonEpic);

export default rootEpic;

// type EpicMiddlewareRoot = CounterEpic | PokemonEpic; // this type is no longer needed so it won't be used as Input and Output types for createEpicMiddleware generic types (now it uses AnyAction both for Input and Output action generic types)

export const epicMiddleware = createEpicMiddleware<AnyAction, AnyAction, RootState>();
```

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) template.

#### Available Scripts

In the project directory, you can run:

##### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

##### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

##### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

##### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

#### Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
