import { LOCALSTORAGE_AUTH_TOKENS } from "common/constants/auth";
import jwtDecode, { JwtPayload } from "jwt-decode";

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export const saveTokens = (tokens: Tokens) => localStorage.setItem(LOCALSTORAGE_AUTH_TOKENS, JSON.stringify(tokens));

export const getTokens = (): Tokens | null => {
  const tokens = localStorage.getItem(LOCALSTORAGE_AUTH_TOKENS);

  if (!tokens) return null;

  return JSON.parse(tokens);
};

export const isTokenExpired = (token: string) => {
  const decodedToken = jwtDecode<JwtPayload>(token);

  return decodedToken.exp ? decodedToken.exp < Date.now() / 1000 : true;
};

export const removeTokens = () => {
  localStorage.removeItem(LOCALSTORAGE_AUTH_TOKENS);
};
