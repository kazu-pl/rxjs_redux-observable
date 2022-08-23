import { Observable } from "rxjs";
import { AjaxConfig, AjaxResponse } from "rxjs/ajax";

type Config = Omit<AjaxConfig, "url" | "body" | "headers" | "method">;

const createAjaxClient = (ajax: <T>(ajaxConfig: AjaxConfig) => Observable<AjaxResponse<T>>) => ({
  get: <T>(url: string, headers?: AjaxConfig["headers"], config?: Config) =>
    ajax<T>({ url, method: "GET", headers, ...config }),

  post: <T>(url: string, body?: any, headers?: AjaxConfig["headers"], config?: Config) =>
    ajax<T>({ url, method: "POST", body, headers, ...config }),

  put: <T>(url: string, body?: any, headers?: AjaxConfig["headers"], config?: Config) =>
    ajax<T>({ url, method: "PUT", body, headers, ...config }),

  patch: <T>(url: string, body?: any, headers?: AjaxConfig["headers"], config?: Config) =>
    ajax<T>({ url, method: "PATCH", body, headers, ...config }),

  delete: <T>(url: string, headers?: AjaxConfig["headers"], config?: Config) =>
    ajax<T>({ url, method: "DELETE", headers, ...config }),
});

export default createAjaxClient;
