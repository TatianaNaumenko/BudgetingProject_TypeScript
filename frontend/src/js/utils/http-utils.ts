import { AuthUtilsTokensType } from "../../types/auth-utils-token.type";
import { Methods } from "../../types/methods.type";
import { ParamsRequestType } from "../../types/params-request.type";
import { ResultRequestType } from "../../types/result-request.type";
import config from "../config/config";
import {AuthUtils} from "./auth-utils";

export class HttpUtils{

   public static async request (url:string,
         method: Methods = Methods.get,
          useAuth:boolean = true, 
          body:any = null ):Promise<ResultRequestType> {
        const result:ResultRequestType = {
            error: false,
            response: null
        }
      

        const params: ParamsRequestType = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },

        }
        let token: string | null = null;
        if (useAuth) {
            token = AuthUtils.getAuthInfo(AuthUtilsTokensType.accessTokenKey);
            if (token) {
                params.headers['x-auth-token'] = token
            }

        }

        if (body) {
            params.body = JSON.stringify(body)
        }

        let response:Response | null = null
        try {
            response = await fetch(config.host + url, params);
            result.response = await response.json()
        } catch (e){
            result.error = true;
            return result;
        }

        if (response.status < 200 || response.status >= 300) {
            result.error = true
            if (useAuth && response.status === 401) {

                if (!token) {
                    // 1 Нет токена
                    result.redirect = '/login'
                } else {
                    // 2 Токен устарел
                    const updateTokenResult:boolean =  await AuthUtils.updateRefreshToken();
                    if (updateTokenResult) {
                        // Делаем запрос повторно
                        return this.request(url, method, useAuth, body)
                    } else {
                        result.redirect = '/login'
                    }
                }
            }

        }

        return result

    }
}