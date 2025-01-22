import { GetOperationsPeriodType } from "../../types/get-operation-period.type";
import { OperationsParamsType } from "../../types/operations-params.type";
import { Period } from "../../types/period.type";

export class DateFilter {
   private getOperations: GetOperationsPeriodType;
   private periodButtons: NodeListOf<HTMLButtonElement>;
   private startDatePicker: HTMLInputElement | null;
    private endDatePicker: HTMLInputElement | null;
    constructor(getOperations: GetOperationsPeriodType) {
        this.getOperations = getOperations;
        this.periodButtons = document.querySelectorAll('.select-interval') as NodeListOf<HTMLButtonElement>;
        this.startDatePicker = document.getElementById('start-date') as HTMLInputElement;
        this.endDatePicker = document.getElementById('end-date') as HTMLInputElement;

        if (this.periodButtons.length > 0 && this.startDatePicker && this.endDatePicker) {
            this.initButtonsListeners();
        } else {
            console.error('One or more elements are missing.');
        }
    }
      
    

  private  initButtonsListeners():void {
        this.periodButtons.forEach(button => {
            button.addEventListener('click', (e:Event) => {
                e.preventDefault();
                this.periodButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                // считываем атрибут
                let period:string | null = button.getAttribute('data-period');
                // вызов функции с парметром значения атрибута 
                if(period){
                    this.filterChange(period);
                }
            
            });
        });
if(this.startDatePicker){
    this.startDatePicker.addEventListener('change', () => {
        let activeButton = document.querySelector('.select-interval.active');
        if (activeButton && activeButton.getAttribute('data-period') === 'interval') {
            this.filterChange('interval');
        }
    });
}
      if( this.endDatePicker){
        this.endDatePicker.addEventListener('change', () => {
            let activeButton = document.querySelector('.select-interval.active');
            if (activeButton && activeButton.getAttribute('data-period') === 'interval') {
                this.filterChange('interval');
            }
        });
      }

     
    }

   private filterChange(period:string):void {
        const { dateFrom, dateTo } = this.calculateDates(period); 
       const periodValue: Period = period as Period;
        const params: OperationsParamsType = { period: periodValue, dateFrom, dateTo };
        this.getOperations(params);
    }

    private calculateDates(period:string):{ dateFrom: string; dateTo: string }  { //вычисляем периоды для фильтра
        let dateFrom:string = '';
        let dateTo:string = '';
        let today:Date = new Date();

        switch (period) {
            case 'today':
                dateFrom = dateTo = today.toISOString().split('T')[0];
                break;
            case 'week':
                let dayOfWeek = today.getDay();
                let diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                let startOfWeek = new Date(today.setDate(diff));
                dateFrom = startOfWeek.toISOString().split('T')[0];
                dateTo = new Date().toISOString().split('T')[0];
                break;
            case 'month':
                let startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                dateFrom = startOfMonth.toISOString().split('T')[0];
                dateTo = new Date().toISOString().split('T')[0];
                break;
            case 'year':
                let startOfYear = new Date(today.getFullYear(), 0, 1);
                dateFrom = startOfYear.toISOString().split('T')[0];
                dateTo = new Date().toISOString().split('T')[0];
                break;
            case 'all':
                dateFrom = '';
                dateTo = '';
                break;
            case 'interval':
                dateFrom = this.startDatePicker?.value || '';
                dateTo = this.endDatePicker?.value || '';
                break;
        }

        return { dateFrom, dateTo };
    }
}