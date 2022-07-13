import { useState } from "react";

import { useAppSelector, useAppDispatch } from "../../../common/store/hooks";
import { incrementByAmount, selectCount, incrementAsync } from "../store/counterSlice";
import styles from "./Counter.module.css";
import Navigation from "components/Navigation";

export function Counter() {
  const dispatch = useAppDispatch();
  const [incrementAmount, setIncrementAmount] = useState("1");

  const count = useAppSelector(selectCount);

  return (
    <div>
      <div className={styles.row}>
        <span className={styles.value}>{count}</span>
      </div>

      <Navigation />

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
    </div>
  );
}
