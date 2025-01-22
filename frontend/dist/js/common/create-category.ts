
import { CategoryStringType } from "../../types/category-string.type";
import { CategoryType } from "../../types/category.type";
import { OpenNewRouteFunction } from "../../types/open-new-route-function.type";
import { ResultRequestType } from "../../types/result-request.type";
import { HttpUtils } from "../utils/http-utils";
import { CategoryDeleter } from "./delete-category";

export class CreateCategory {
     readonly openNewRoute:OpenNewRouteFunction;
     private categoryType: CategoryStringType;
   constructor(openNewRoute:OpenNewRouteFunction, categoryType:CategoryStringType) {
      this.openNewRoute = openNewRoute;
      this.categoryType = categoryType;
      this.getCategories().then();
   }

  private async getCategories():Promise<void> {
      const result:ResultRequestType = await HttpUtils.request(`/categories/${this.categoryType}`);

      if (result.redirect) {
         return this.openNewRoute(result.redirect);
      }

      if (result.error || !result.response || (result.response && result.response.error)) {
         console.log(result.response.message || 'Возникла ошибка при запросе. Обратитесь в поддержку');
         return;
      }

      this.getCategoryList(result.response);
   }

  private getCategoryList(categories:CategoryType[]):void {
      let cardsElement:HTMLElement | null = document.getElementById('cards');

      if (cardsElement) {
         cardsElement.innerHTML = "";
         categories.forEach(category => {
            let cardElement: HTMLElement = this.createCategoryCard(category);
            cardsElement.appendChild(cardElement);
         });
      }

      this.addNewCardLink(cardsElement);
      this.categoryDeleteEventListeners();
   }

 private  createCategoryCard(category:CategoryType):HTMLElement {
      const cardElement:HTMLElement = document.createElement('div');
      cardElement.className = 'col-md-4 mb-4';
      cardElement.innerHTML = `
           <div class="card h3 p-3 text-purple-dark">
               ${category.title}
               <div class="action pt-3">
                   <a href="/edit-${this.categoryType}?id=${(category.id).toString()}&title=${category.title}" class="btn btn-primary">Редактировать</a>
                   <a href="javascript:void(0)" class="delete-card btn btn-danger" data-bs-toggle="modal" data-bs-target="#exampleModal"
                   data-id="${(category.id).toString()}" data-title="${category.title}">Удалить</a>
               </div>
           </div>
       `;
      return cardElement;
   }

  private addNewCardLink(cardsElement:HTMLElement | null):void {
   if (!cardsElement) return;
      const cardLinkElement:HTMLElement = document.createElement('div');
      cardLinkElement.className = 'col-md-4 mb-4';
      cardLinkElement.innerHTML = `
       <div class="card new-card  h3 p-3 text-purple-dark d-flex  justify-content-center align-items-center">
                         <a href="/create-${this.categoryType}" class="text-center text-decoration-none">
               <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M14.5469 6.08984V9.05664H0.902344V6.08984H14.5469ZM9.32422 0.511719V15.0039H6.13867V0.511719H9.32422Z" fill="#CED4DA"/>
                </svg>
        </a>
          
       </div>
   `;

      cardsElement.appendChild(cardLinkElement);

      cardLinkElement.addEventListener('click', (event:Event) => {
         const target = event.target as HTMLElement; 
         if (target.closest('.new-card')) {
            window.location.href = `/create-${this.categoryType}`;
         }
      });
   }

  private categoryDeleteEventListeners():void {
      const deleteBtn  = document.getElementById('delete-btn') as HTMLButtonElement  | null;
  
      if (deleteBtn) {
         deleteBtn.addEventListener('click', (e:Event) => {
             e.preventDefault();
             const categoryId = deleteBtn.getAttribute('data-id');
             const categoryTitle = deleteBtn.getAttribute('data-title');
             if (categoryId && categoryTitle) {
                 CategoryDeleter.deleteCategory(this.categoryType, Number(categoryId), categoryTitle, this.openNewRoute);
             }
         });
     }
  
      // Обработчик для клика на карточку удаления
      document.addEventListener('click', (event) => {
         const target = event.target as HTMLElement; 
          if (target.classList.contains('delete-card')) {
              const categoryId = target.getAttribute('data-id');
              const categoryTitle = target.getAttribute('data-title');
  
              // Устанавливаем данные для кнопки удаления
              if (deleteBtn) {
               deleteBtn.setAttribute('data-id', categoryId || '');
               deleteBtn.setAttribute('data-title', categoryTitle || '');
           }
          }
      });
  }
}

