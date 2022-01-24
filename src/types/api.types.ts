export interface Pokemon {
  name: string;
  url: string;
}

export interface FetchAllPokemonsResponse {
  count: number;
  next: null | string;
  precious: null | string;
  results: Pokemon[];
}
