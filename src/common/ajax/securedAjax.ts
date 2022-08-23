import { catchError, tap, throwError, mergeMap } from "rxjs";
import { ajax, AjaxConfig, AjaxError } from "rxjs/ajax";

import { getTokens, saveTokens } from "common/auth/tokens";
import { API_URL } from "common/constants/env";
import { Tokens } from "types/api.types";
import createAjaxClient from "./createAjaxClient";
// import i18n from "i18n";

function securedAjaxFunction<T>({ url, headers, ...restOfCinfig }: AjaxConfig) {
  return ajax<T>({
    url: `${API_URL + url}`,
    headers: {
      Authorization: `Bearer ${getTokens()?.accessToken}`,
      // "Accept-Language": i18n.language,
      ...headers,
    },
    ...restOfCinfig,
    // withCredentials: true, // enable to rend crossOrigin credentials like cookies
  }).pipe(
    catchError((error: AjaxError) => {
      if (error.status === 401) {
        return ajax
          .post<Tokens>(`${API_URL}/cms/refresh-token`, {
            refreshToken: getTokens()!.refreshToken,
          })
          .pipe(
            tap((value) => {
              saveTokens({
                accessToken: value.response.accessToken,
                refreshToken: getTokens()!.refreshToken,
              });
            }),
            mergeMap((val) => {
              return ajax<T>({
                url: `${API_URL}${url}`,
                headers: {
                  Authorization: `Bearer ${getTokens()?.accessToken}`,
                  // "Accept-Language": i18n.language,
                  ...headers,
                },
                ...restOfCinfig,
                // withCredentials: false, // enable to send crossOrigin credentials like cookies
              });
            }),
            catchError((error: AjaxError) => {
              const from = window.location.href.slice(window.location.origin.length);
              const fromWithoutQuery = from.indexOf("?") > 0 ? from.slice(0, from.indexOf("?")) : from;

              window.location.href = `/logout?reason=refreshtokenexpired&from=${fromWithoutQuery}`;

              return throwError(() => error);
            })
          );
      } else {
        return throwError(() => error);
      }
    })
  );
}

const securedAjax = createAjaxClient(securedAjaxFunction);

export default securedAjax;
