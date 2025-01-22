import { CategoryStringType } from "../../types/category-string.type";
import { CategoryType } from "../../types/category.type";
import { Methods } from "../../types/methods.type";
import { OpenNewRouteFunction } from "../../types/open-new-route-function.type";
import { ResultRequestType } from "../../types/result-request.type";
import { HttpUtils } from "../utils/http-utils";

export class CreateIncomeExpenseInIncomeExpense {
    readonly openNewRoute: OpenNewRouteFunction;
    private typeSelectElement: HTMLSelectElement | null;
    private categorySelectElement: HTMLSelectElement | null;
    private sumElement: HTMLInputElement | null;
    private dateElement: HTMLInputElement | null;
    private commentElement: HTMLInputElement | null;
    private operation!: CategoryType[];
    private createButtonElement: HTMLButtonElement | null;

    constructor(openNewRoute: OpenNewRouteFunction, type: CategoryStringType) {
        this.openNewRoute = openNewRoute;
        this.typeSelectElement = document.getElementById('type-select') as HTMLSelectElement;
        this.categorySelectElement = document.getElementById('category') as HTMLSelectElement;
        this.sumElement = document.getElementById('sum') as HTMLInputElement;
        this.dateElement = document.getElementById('date') as HTMLInputElement;
        this.commentElement = document.getElementById('comment') as HTMLInputElement;
        this.createButtonElement = document.getElementById('create-button') as HTMLButtonElement;

        this.getCategories(type).then();

        this.typeSelectElement.addEventListener('change', () => {
            this.showCategories(this.operation);
        })

        this.createButtonElement.addEventListener('click', this.saveOperation.bind(this));
    }


    private async getCategories(type: CategoryStringType): Promise<void> {
        try {
            const result: ResultRequestType = await HttpUtils.request(`/categories/${type}`);

            // Проверка на ошибки в результате
            if (result.error || !result.response) {
                throw new Error('Не удалось загрузить категории. Попробуйте еще раз.');
            }

            this.operation = result.response;

            this.showCategories(this.operation);
            this.showOption(type);
        } catch (error) {
            // Проверяем, является ли ошибка экземпляром Error
            if (error instanceof Error) {
                console.error('Ошибка при получении категорий:', error);
                alert(error.message || 'Произошла ошибка при загрузке категорий. Обратитесь в поддержку.');
            }
        }
    }

    private showOption(type: CategoryStringType): void {
        const optionElement: HTMLOptionElement | null = document.createElement('option');
        optionElement.setAttribute('value', type);
        optionElement.setAttribute('selected', 'selected')
        optionElement.innerText = type === 'income' ? 'Доход' : 'Расход';
        if (this.typeSelectElement) {
            this.typeSelectElement.appendChild(optionElement);
            this.showCategories(this.operation);
        }

    }

    private showCategories(operation: CategoryType[]): void {
        for (let i = 0; i < operation.length; i++) {
            const optionElement: HTMLOptionElement | null = document.createElement('option');
            optionElement.setAttribute("value", (operation[i].id).toString());
            optionElement.innerText = operation[i].title;
            if (this.categorySelectElement) {
                this.categorySelectElement.appendChild(optionElement);
            }

        }

    }


    private validateForm(): boolean {
        let isValid: boolean = true;
        let textInputArray: (HTMLSelectElement | HTMLInputElement)[] = [
            this.typeSelectElement!,
            this.categorySelectElement!,
            this.sumElement!,
            this.dateElement!,
            this.commentElement!
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

    private async saveOperation(e: Event) {
        e.preventDefault();
        if (this.validateForm()) {
            const result = await HttpUtils.request('/operations', Methods.post, true, {
                type: this.typeSelectElement!.value,
                amount: this.sumElement!.value,
                date: this.dateElement!.value,
                comment: this.commentElement!.value,
                category_id: Number(this.categorySelectElement!.value)
            });
            if (result.redirect) {
                this.openNewRoute(result.redirect);
                return;
            }

            if (result.error || !result.response || (result.response && result.response.error)) {
                console.log(result.response.message);
                alert('Возникла ошибка при запросе категорий');
                return;
            }
            this.openNewRoute('/incomes-expenses');
            return;
        }
    }


}