import { AuthUtilsTokensType } from "../../types/auth-utils-token.type";
import { DefaultResponseType } from "../../types/default-response.type";
import { RefreshResponseType } from "../../types/refresh-response.type";
import { UserInfoType } from "../../types/user-info.type";
import config from "../config/config";

export class AuthUtils {


   public static setAuthInfo(accessToken: string | null, refreshToken: string | null, userInfo?: UserInfoType | null): void {
      if (accessToken !== null) {
         localStorage.setItem(AuthUtilsTokensType.accessTokenKey, accessToken);
      }
      if (refreshToken !== null) {
         localStorage.setItem(AuthUtilsTokensType.refreshTokenKey, refreshToken);
      }

      if (userInfo) {
         localStorage.setItem(AuthUtilsTokensType.userInfoKey, JSON.stringify(userInfo));
      }

   }
   public static removeAuthInfo(): void {

      localStorage.removeItem(AuthUtilsTokensType.accessTokenKey);
      localStorage.removeItem(AuthUtilsTokensType.refreshTokenKey);
      localStorage.removeItem(AuthUtilsTokensType.userInfoKey);
   }


   public static getAuthInfo(key: AuthUtilsTokensType | null): string | null {
      if (key && Object.values(AuthUtilsTokensType).includes(key)) {
         return localStorage.getItem(key);

      }
      return null;
   }

   public static async updateRefreshToken(): Promise<boolean> {
      let result: boolean = false;
      const refreshToken = this.getAuthInfo(AuthUtilsTokensType.refreshTokenKey);
      if (refreshToken) {
         const response: Response = await fetch(config.host + '/refresh', {
            method: 'POST',
            headers: {
               'Content-type': 'application/json',
               'Accept': 'application/json',
            },
            body: JSON.stringify({ refreshToken: refreshToken })
         });
         if (response && response.status === 200) {
            const tokens: RefreshResponseType | DefaultResponseType = await response.json();
            if ('error' in tokens) {
               // Обработка ошибки
               console.error(tokens.message);
            } else {

               AuthUtils.setAuthInfo(tokens.accessToken, tokens.refreshToken);
               result = true;
            }
         }
      }
      if (!result) {
         this.removeAuthInfo();
      }
      return result;
   }

}