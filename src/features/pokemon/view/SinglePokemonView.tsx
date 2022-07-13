import { useAppDispatch, useAppSelector } from "common/store/hooks";
import Navigation from "components/Navigation";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchSinglePokemonStart, selectIsFetchingSinglePokemon, selectSinglePokemon } from "../store/pokemonSlice";

const SinglePokemonView = () => {
  const { name } = useParams();

  const isFetching = useAppSelector(selectIsFetchingSinglePokemon);
  const data = useAppSelector(selectSinglePokemon);

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchSinglePokemonStart({ pokemonName: name! }));
  }, [dispatch, name]);

  if (isFetching) {
    return (
      <div>
        <h1>loading . . .</h1>
      </div>
    );
  }

  return (
    <div>
      <h1>SinglePokemonView</h1>
      <Navigation />
      <h3>Name: {data?.name}</h3>
    </div>
  );
};

export default SinglePokemonView;
