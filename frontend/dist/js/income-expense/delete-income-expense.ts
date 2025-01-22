import { Methods } from "../../types/methods.type";
import { OpenNewRouteFunction } from "../../types/open-new-route-function.type";
import { ResultRequestType } from "../../types/result-request.type";
import { HttpUtils } from "../utils/http-utils";

export class DeleteIncomeExpense {
readonly openNewRoute: OpenNewRouteFunction;
   constructor(openNewRoute: OpenNewRouteFunction) {
       this.openNewRoute = openNewRoute;
       let urlParams = new URLSearchParams(window.location.search); //находим нужный id
       let id = urlParams.get('id');
       if(!id){
        this.openNewRoute('/');
        return;
       }
       this.deleteOperation(id).then();

   }

  private async deleteOperation(id:string): Promise <void>{ //удаляем операцию
    try {
        let result:ResultRequestType = await HttpUtils.request('/operations/' + id, Methods.delete, true);
        if(result.redirect){
          this.openNewRoute(result.redirect);
          return 
        }
 
        if (result.error || !result.response || (result.response && result.response.error)) {
            console.log(result.response.message);
            console.log('Возникла ошибка при удалении операции');
            return;
        }
        this.openNewRoute('/incomes-expenses');
    }
   catch (error){
    console.error('Ошибка в deleteOperation:', error);
   }
      

   }
}