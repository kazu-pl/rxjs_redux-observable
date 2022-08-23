import { API_URL } from "common/constants/env";
import { ajax as rxjsAjax, AjaxConfig } from "rxjs/ajax";
import createAjaxClient from "./createAjaxClient";

const ajaxFunction = <T>({ url, ...restOfConfig }: AjaxConfig) =>
  rxjsAjax<T>({
    url: `${API_URL + url}`,
    ...restOfConfig,
  });

const ajax = createAjaxClient(ajaxFunction);

export default ajax;
