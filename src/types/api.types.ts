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

export interface Tokens {
  /** token used to authenticate and authorize user. */
  accessToken: string;

  /** token used to regenerate new accessToken if it expired */
  refreshToken: string;
}
