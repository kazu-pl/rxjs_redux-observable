import { useAppDispatch, useAppSelector } from "common/store/hooks";
import Navigation from "components/Navigation";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchPokemons, selectData, selectIsFetching } from "../store/pokemonSlice";

const PokemonsList = () => {
  const isFetchingPokemonList = useAppSelector(selectIsFetching);
  const pokemons = useAppSelector(selectData);

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchPokemons({ page: 1, pageSize: 10, sortBy: "createdAt", sortDirection: "asc", search: null }));
  }, [dispatch]);

  if (isFetchingPokemonList) {
    return <h1>loading . . .</h1>;
  }
  return (
    <div>
      <h1>PokemonList</h1>

      <Navigation />

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: 600, width: "100%" }}>
          {pokemons?.map((pokemon) => (
            <div key={pokemon.name} style={{ padding: `16px`, width: `100%`, border: `1px solid white` }}>
              <p>name: {pokemon.name}</p>
              <Link to={pokemon.name} style={{ color: "white" }}>
                Visit
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PokemonsList;
