import { CategoryStringType } from "../../types/category-string.type";
import { CategoryType } from "../../types/category.type";
import { Methods } from "../../types/methods.type";
import { OpenNewRouteFunction } from "../../types/open-new-route-function.type";
import { OperationDataType } from "../../types/operation-data.type";
import { ResultRequestType } from "../../types/result-request.type";
import { HttpUtils } from "../utils/http-utils";

export class EditIncomeExpense {
    readonly openNewRoute: OpenNewRouteFunction;
    private typeSelectElement!: HTMLSelectElement;
    private categorySelectElement!: HTMLSelectElement;
    private sumElement!: HTMLInputElement;
    private dateElement!: HTMLInputElement;
    private commentElement!: HTMLTextAreaElement;
    private operationOriginalData!: OperationDataType | null;

    constructor(openNewRoute:OpenNewRouteFunction) {
        this.openNewRoute = openNewRoute;
        const urlParams = new URLSearchParams(window.location.search)
        const id = urlParams.get('id')
        if (!id) {
            this.openNewRoute('/');
            return 
        }
        this.init(id).then();
        this.typeSelectElement = document.getElementById('type-select') as HTMLSelectElement;
        this.categorySelectElement = document.getElementById('category') as HTMLSelectElement;
        this.sumElement = document.getElementById('sum') as HTMLInputElement;
        this.dateElement = document.getElementById('date') as HTMLInputElement;
        this.commentElement = document.getElementById('comment') as HTMLTextAreaElement;
        this.operationOriginalData = null;
        // this.typeOperation = null;

        document.getElementById('update-button')?.addEventListener('click', this.updateIncomeExpense.bind(this));

    }
// 
  private  async init(id:string):Promise<void> {
        const operationData = await this.getOperation(id).then();
        console.log(operationData);
        if (operationData) {
            this.showOption(operationData);
        }


    }
    //получит обект с опциями операции по id
  private  async getOperation(id:string):Promise<OperationDataType | null>  {
        try {
            const result:ResultRequestType = await HttpUtils.request(`/operations/${id}`);

            if (result.error || !result.response) {
                throw new Error('Не удалось загрузить операцию. Попробуйте еще раз.');
            }

            this.operationOriginalData = result.response;
            return result.response;

        } catch (error) {
            if(error instanceof Error){
                console.error('Ошибка при получении операции:', error);
                alert(error.message || 'Произошла ошибка при загрузке операции. Обратитесь в поддержку.');
            }

            return null
        }
    }

   private showOption(operation:OperationDataType): void {
        const optionElement:HTMLOptionElement = document.createElement('option');
        optionElement.setAttribute('value', operation.type);
        optionElement.selected = true;
        optionElement.innerText = operation.type === 'income' ? 'Доход' : 'Расход';
        this.typeSelectElement.appendChild(optionElement);
        this.typeSelectElement.disabled = true
        this.showCategories(operation.type, operation.category).then();
        this.sumElement.value = (operation.amount).toString()ж
        this.dateElement.value = operation.date
        this.commentElement.value = operation.comment
        if (this.categorySelectElement) {
            for (let i = 0; i < this.categorySelectElement.options.length; i++) {
                if (this.categorySelectElement.options[i].value === operation.category) {
                    this.categorySelectElement.selectedIndex = i
                }

            }
        }
    }


   private async showCategories(type:CategoryStringType, selectedCategory:string) {
        try {
            const categories = await this.getCategories(type);

            // Очищаем предыдущие опции
            this.categorySelectElement.innerHTML = '';

            // Добавляем новые опции
            categories.forEach(category => {
                const optionElement = document.createElement('option');
                optionElement.setAttribute("value", (category.id).toString());
                optionElement.innerText = category.title;
                this.categorySelectElement.appendChild(optionElement);

                // Устанавливаем выбранную категорию
                if (category.title === selectedCategory) {
                    optionElement.selected = true; // Устанавливаем флаг selected
                }
            });
        } catch (error) {
            console.error('Ошибка при получении категорий:', error);
            alert('Не удалось загрузить категории. Попробуйте еще раз.');
        }
    }
    //этот код вынести в отдельный файл можно 
  private  async getCategories(type:CategoryStringType): Promise<CategoryType[]> {
        try {
            const result:ResultRequestType = await HttpUtils.request(`/categories/${type}`);

            // Проверка на ошибки в результате
            if (result.error || !result.response) {
                throw new Error('Не удалось загрузить категории. Попробуйте еще раз.');
            }

            return result.response;

        } catch (error) {
            if(error instanceof Error){
                console.error('Ошибка при получении операции:', error);
                alert(error.message || 'Произошла ошибка при загрузке операции. Обратитесь в поддержку.');
            }

            return [];
        }
    }


   private validateForm():boolean {
        let isValid = true;
        let textInputArray = [
            this.typeSelectElement,
            this.categorySelectElement,
            this.sumElement,
            this.dateElement,
            this.commentElement
        ]
        for (let i = 0; i < textInputArray.length; i++) {

            if (textInputArray[i].value) {
                textInputArray[i].classList.remove('is-invalid');
            } else {
                textInputArray[i].classList.add('is-invalid');
                isValid = false
            }
        }

        return isValid;
    }


   private async updateIncomeExpense(e:Event) {
        e.preventDefault()
        if (this.validateForm()) {
            const changedData: Partial<OperationDataType> = {}
            if (this.sumElement.value !== this.operationOriginalData?.amount.toString()) {
                changedData.amount = Number(this.sumElement.value)
            }
            if (this.typeSelectElement.value !== this.operationOriginalData?.type) {
                changedData.type = this.typeSelectElement.value as CategoryStringType;
            }
            if (this.categorySelectElement.value !== this.operationOriginalData?.category) {
                changedData.category = this.categorySelectElement.value
            }
            if (this.dateElement.value !== this.operationOriginalData?.date) {
                changedData.date = this.dateElement.value
            }
            if (this.commentElement.value !== this.operationOriginalData?.comment) {
                changedData.comment = this.commentElement.value
            }

            if (Object.keys(changedData).length > 0) {

                const result = await HttpUtils.request('/operations/' + this.operationOriginalData?.id, Methods.put, true, {
                    type: this.typeSelectElement.value,
                    amount: this.sumElement.value,
                    date: this.dateElement.value,
                    comment: this.commentElement.value,
                    category_id: Number(this.categorySelectElement.value)
                })

                if (result.redirect) {
                    this.openNewRoute(result.redirect);
                    return
                }

                if (result.error || !result.response || (result.response && result.response.error)) {
                     console.log('Возникла ошибка при Редактирование. Обратитесь в поддержку');
                     return
                }
                this.openNewRoute('/incomes-expenses');
                return
            }
        }
    }
}


