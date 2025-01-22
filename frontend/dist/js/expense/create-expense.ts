import { Methods } from "../../types/methods.type";
import { OpenNewRouteFunction } from "../../types/open-new-route-function.type";
import { HttpUtils } from "../utils/http-utils";

export class CreateExpense {
       readonly openNewRoute: OpenNewRouteFunction;
       private inputElement: HTMLInputElement | null;
       private createExpenseBtn:HTMLButtonElement | null;
   constructor(openNewRoute: OpenNewRouteFunction) {
       this.openNewRoute = openNewRoute;

       this.inputElement = document.getElementById('createExpensesCategory') as HTMLInputElement;
       this.createExpenseBtn =  document.getElementById('createExpensesCategoryBtn') as HTMLButtonElement;
      this.createExpenseBtn.addEventListener('click', this.saveCategory.bind(this));
   }

   private validateForm():boolean{
    let isValid = true;
    if(this.inputElement){
        if(this.inputElement.value){
            this.inputElement.classList.remove('is-invalid');
        } else {
            this.inputElement.classList.add('is-invalid');
            isValid = false;
        }
    }
  
    return isValid;
}

 private  async saveCategory(e:Event): Promise<void>{
       e.preventDefault();
       if (this.validateForm() && this.inputElement) { // Проверяем на null
            try {
                const result = await HttpUtils.request('/categories/expense', Methods.post, true, {
                    title: this.inputElement.value
                });
    
                if (result.redirect) {
                    this.openNewRoute(result.redirect);
                    return;
                }
                if (result.error || !result.response || (result.response && result.response.error)) {
                    console.log(result.response?.message);
                    alert('Возникла ошибка добавлении категории расхода');
                    return;
                }
                this.openNewRoute('/expenses');
            } catch (error) {
                console.error('Ошибка при добавлении категории:', error);
                alert('Произошла ошибка. Пожалуйста, попробуйте еще раз.');
            }
        }
}
}