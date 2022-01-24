import { combineEpics } from "redux-observable";
import { createEpicMiddleware } from "redux-observable";
import { RootState } from "./rootReducer";

import counterEpic, { CounterEpic } from "features/counter/store/counterEpic";
import pokemonEpic, { PokemonEpic } from "features/pokemon/store/pokemonEpic";

const rootEpic = combineEpics(counterEpic, pokemonEpic);

export default rootEpic;

type EpicMiddlewareRoot = CounterEpic | PokemonEpic;

export const epicMiddleware = createEpicMiddleware<EpicMiddlewareRoot, EpicMiddlewareRoot, RootState>();
