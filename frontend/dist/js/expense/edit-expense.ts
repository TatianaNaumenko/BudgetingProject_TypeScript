import { Methods } from "../../types/methods.type";
import { OpenNewRouteFunction } from "../../types/open-new-route-function.type";
import { HttpUtils } from "../utils/http-utils";

export class EditExpense {
      readonly openNewRoute: OpenNewRouteFunction;
      private id: string | null;
      private title: string | null;
      private inputElement: HTMLInputElement | null;
      private editExpensesCategoryBtn: HTMLButtonElement | null;

   constructor(openNewRoute:OpenNewRouteFunction) {
       this.openNewRoute = openNewRoute;
       const urlParams = new URLSearchParams(window.location.search);
       this.title = urlParams.get('title');
       this.id = urlParams.get('id');
       this.inputElement = document.getElementById('editExpensesCategory') as HTMLInputElement;
       this.editExpensesCategoryBtn =  document.getElementById('editExpensesCategoryBtn') as HTMLButtonElement;
       if (!this.id) {
          this.openNewRoute('/');
          return
       }
     


     this.editExpensesCategoryBtn .addEventListener('click', this.editCategory.bind(this));
       this.showValue()
   }



  private validateForm() :boolean{
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

   private showValue(): void {
    if (this.inputElement && this.title) {
       this.inputElement.value = this.title;

    }

 }


   private async editCategory(e: Event): Promise<void> {
      e.preventDefault();
      if (this.validateForm()) {
         const result = await HttpUtils.request('/categories/expense/' + this.id, Methods.put, true, {
            title: this.inputElement?.value
         });

         if (result.redirect) {
            this.openNewRoute(result.redirect);
            return;
         }
         if (result.error || !result.response || (result.response && result.response.error)) {
            console.log(result.response.message);
            alert('Возникла ошибка редактировании категории расхода');
            return
         }
         return this.openNewRoute('/expenses');
      }
   }
}