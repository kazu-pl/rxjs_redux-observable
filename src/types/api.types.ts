export interface Pokemon {
  name: string;
  url: string;
}

export interface FetchAllPokemonsResponse {
  count: number;
  next: null | string;
  previous: null | string;
  results: Pokemon[];
}
