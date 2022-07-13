import { Counter } from "./features/counter/view/Counter";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PokemonsList from "features/pokemon/view/PokemonsList";
import SinglePokemonView from "features/pokemon/view/SinglePokemonView";
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
          <Routes>
            <Route element={<Counter />} path="/" />
            <Route element={<PokemonsList />} path="/pokemons" />
            <Route element={<SinglePokemonView />} path="/pokemons/:name" />
          </Routes>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
