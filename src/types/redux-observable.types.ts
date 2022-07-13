import { RootState } from "common/store/rootReducer";
import { Epic } from "redux-observable";
import { RootEpicAction } from "../common/store/rootEpic";

export type ReduxObservableEpic = Epic<RootEpicAction, RootEpicAction, RootState>;
