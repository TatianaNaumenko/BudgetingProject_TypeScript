import { Methods } from "../../types/methods.type";
import { ResultRequestType } from "../../types/result-request.type";
import { HttpUtils } from "../utils/http-utils";

export class BalanceService{
   private static instance: BalanceService | null;
    #balanceValue: number = 0;
   readonly openNewRoute: (url: string) => Promise<void>;

   constructor(openNewRoute: (url:string)=> Promise<void>){
      this.openNewRoute = openNewRoute;
      if(BalanceService.instance) {
         return BalanceService.instance
      }
      BalanceService.instance = this; 
   }
  
  public get balance(): number{
      return this.#balanceValue;
   }
  public async requestBalance(): Promise<void>{
          const result: ResultRequestType = await HttpUtils.request('/balance')
      if (result.redirect) {
         return this.openNewRoute(result.redirect);
      }
      if (result.error || !result.response || (result.response && result.response.error)) {
         return console.log('Возникла ошибка при запросе Баланса. Обратитесь в поддержку ')
      }
      this.#balanceValue = result.response.balance;
      console.log(`Баланс обновлён: ${this.#balanceValue}`);
   }

   public async updateBalance(newBalance:number): Promise<ResultRequestType | void> {
      const result:ResultRequestType = await HttpUtils.request('/balance', Methods.put, true, {
         newBalance: newBalance
      });

      if (result.redirect) {
         return this.openNewRoute(result.redirect);
      }

      if (result.error || !result.response || (result.response && result.response.error)) {
         console.log('Возникла ошибка при обновлении Баланса. Обратитесь в поддержку');
         return;
      }

      // Обновление внутреннего значения баланса
      this.#balanceValue = result.response.balance;
      console.log(`Баланс обновлён: ${this.#balanceValue}`);
      return result
   }
}