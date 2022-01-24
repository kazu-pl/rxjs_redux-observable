import { useState } from "react";

import { fetchAllPolemons, selectData, selectIsFetching } from "features/pokemon/store/pokemonSlice";

import { useAppSelector, useAppDispatch } from "../../../common/store/hooks";
import { incrementByAmount, selectCount, incrementAsync } from "../store/counterSlice";
import styles from "./Counter.module.css";

export function Counter() {
  const dispatch = useAppDispatch();
  const [incrementAmount, setIncrementAmount] = useState("1");

  const count = useAppSelector(selectCount);

  const pokemonData = useAppSelector(selectData);
  const isPokemonsFetching = useAppSelector(selectIsFetching);

  return (
    <div>
      <div className={styles.row}>
        <span className={styles.value}>{count}</span>
      </div>

      <div className={styles.row}>
        <input
          className={styles.textbox}
          aria-label="Set increment amount"
          value={incrementAmount}
          onChange={(e) => setIncrementAmount(e.target.value)}
        />
        <button className={styles.button} onClick={() => dispatch(incrementByAmount(Number(incrementAmount) || 0))}>
          Add Amount
        </button>
        <button onClick={() => dispatch(incrementAsync())}>add async</button>
      </div>

      <div className={styles.row}>
        <button onClick={() => dispatch(fetchAllPolemons())}>FETCH POKEMONS</button>
      </div>

      {isPokemonsFetching && <p>fetching . . .</p>}

      <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
        {pokemonData?.map((pokemon, index) => (
          <div style={{ padding: 8, border: `1px solid #777`, maxWidth: 500 }} key={index}>
            <p>{pokemon.name}</p>
            <p>{pokemon.url}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
