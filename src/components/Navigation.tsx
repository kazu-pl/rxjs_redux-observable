import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <Link to={"/"} style={{ color: "white" }}>
        Counter / Home
      </Link>
      <Link to={"/pokemons"} style={{ color: "white" }}>
        Pokemons
      </Link>
    </div>
  );
};

export default Navigation;
