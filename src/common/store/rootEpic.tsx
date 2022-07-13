import { combineEpics } from "redux-observable";
import { createEpicMiddleware } from "redux-observable";
import { RootState } from "./rootReducer";

import counterEpic, { CounterEpic } from "features/counter/store/counterEpic";
import pokemonEpic, { PokemonEpic } from "features/pokemon/store/pokemonEpic";

const rootEpic = combineEpics(counterEpic, pokemonEpic);

export default rootEpic;

export type RootEpicAction = CounterEpic | PokemonEpic;

export const epicMiddleware = createEpicMiddleware<RootEpicAction, RootEpicAction, RootState>();
