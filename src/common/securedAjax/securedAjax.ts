import { catchError, Observable, tap, throwError, mergeMap } from "rxjs";
import { ajax, AjaxError, AjaxResponse } from "rxjs/ajax";
import { AjaxCreationMethod } from "rxjs/internal/ajax/ajax";

import { getTokens, saveTokens } from "common/auth/tokens";
import { API_URL } from "common/constants/env";
import { Tokens } from "types/api.types";
// import i18n from "i18n";

type AllHTTPMethods = Exclude<keyof AjaxCreationMethod, "getJSON">;
type MethodsWithoutBody = Extract<AllHTTPMethods, "get" | "delete">;
type MethodsWithBody = Exclude<AllHTTPMethods, "get" | "delete">;

function securedAjax<Response = any>(url: string, method: MethodsWithoutBody): Observable<AjaxResponse<Response>>;
function securedAjax<Response = any>(
  url: string,
  method: MethodsWithBody,
  body?: any
): Observable<AjaxResponse<Response>>;
function securedAjax<Response = any>(url: string, method: MethodsWithoutBody | MethodsWithBody, body?: any) {
  return ajax<Response>({
    url: `${API_URL}${url}`,
    method,
    body,
    headers: {
      Authorization: `Bearer ${getTokens()?.accessToken}`,
      // "Accept-Language": i18n.language,
    },
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
              return ajax<Response>({
                url: `${API_URL}${url}`,
                method,
                body,
                headers: {
                  Authorization: `Bearer ${getTokens()?.accessToken}`,
                  // "Accept-Language": i18n.language,
                },
                // withCredentials: false, // enable to rend crossOrigin credentials like cookies
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

export default securedAjax;
