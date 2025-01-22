import { CategoryStringType } from "../../types/category-string.type";
import { Methods } from "../../types/methods.type";
import { OpenNewRouteFunction } from "../../types/open-new-route-function.type";
import { OperationDataType } from "../../types/operation-data.type";
import { ResultRequestType } from "../../types/result-request.type";
import { HttpUtils } from "../utils/http-utils";



export class CategoryDeleter {
  public  static async deleteCategory(categoryType:CategoryStringType, id:number, categoryTitle:string, openNewRoute:OpenNewRouteFunction):Promise<void> {
        const categoryRoute = categoryType === 'income' ? '/categories/income/' : '/categories/expense/';
        const redirectRoute = categoryType === 'income' ? '/incomes' : '/expenses';
        // получить категорию на удаление по id
        // получить все операции перебрать и если ы операция.категория === категория.title удалить операцию
      try {
        const result2:ResultRequestType = await HttpUtils.request('/operations?period=all');
        let allOperations:OperationDataType[] = result2.response;
        // console.log(allOperations);
            let operationsWithCategoryTitle = allOperations.filter( operation => operation.category?.toLowerCase().trim() === categoryTitle.toLowerCase().trim());
        // console.log(operationsWithCategoryTitle);
        const result:ResultRequestType = await HttpUtils.request(categoryRoute + id, Methods.delete, true);
        for ( let operation of operationsWithCategoryTitle) {
                        const deleteResult:ResultRequestType = await HttpUtils.request('/operations/' + operation.id, Methods.delete, true);

                        if (deleteResult.redirect) {
                            return openNewRoute(deleteResult.redirect);
                        }

            if (result.error || !result.response || (result.response && result.response.error)) {
                console.log(result.response.message);
               alert('Возникла ошибка при удалении операции');
               return ;
            }
        }
      
        if (result.redirect) {
            return openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            console.log(result.response.message);
           alert('Возникла ошибка при удалении категории');
           return
        }

         openNewRoute(redirectRoute);
      }catch (error){
        console.error('Произошла ошибка:', error);
        alert('Возникла ошибка, попробуйте еще раз.');
      }
     
       
    }
}
