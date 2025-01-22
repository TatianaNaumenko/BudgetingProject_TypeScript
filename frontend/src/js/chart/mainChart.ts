import { Chart } from "chart.js";
import { OpenNewRouteFunction } from "../../types/open-new-route-function.type";
import { DateFilter } from "../config/data-filter";
import { HttpUtils } from "../utils/http-utils";
import { Period } from "../../types/period.type";
import { ResultRequestType } from "../../types/result-request.type";
import { OperationDataType } from "../../types/operation-data.type";
import { OperationsParamsType } from "../../types/operations-params.type";
import { CategoryStringType } from "../../types/category-string.type";
import { ChartObjectType } from "../../types/chart-object.type";

export class MainChart {
    readonly openNewRoute:OpenNewRouteFunction;
    private incomeChart:Chart <'pie', number[], string> | null ;
    private expensesChart:Chart <'pie', number[], string> | null;
    constructor(openNewRoute:OpenNewRouteFunction) {

        this.openNewRoute = openNewRoute;
        this.incomeChart = null; 
        this.expensesChart = null;

            this.init();
    }

  private  async init():Promise<void> {
        await this.getOperations({ period: Period.all }); // Получаем все операции
  
        new DateFilter(this.getOperations.bind(this)); // Инициализируем DateFilter
    }

   private async getOperations(params:OperationsParamsType):Promise<void> {
    const { period, dateFrom, dateTo } = params;
        let url = '/operations?period=all';
        if (period !== 'all') {
            url = `/operations?period=interval&dateFrom=${dateFrom}&dateTo=${dateTo}`;
        }

        try {
            const result:ResultRequestType = await HttpUtils.request(url);
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }
            if (result.error || !result.response || (result.response && result.response.error)) {
                throw new Error('Возникла ошибка при запросе операций');
            }
           
            this.loadOperationsIntoChart(result.response);
        } catch (error) {
            if (error instanceof Error){
                console.log(error.message);
            }
          
        }
    }

private loadOperationsIntoChart(operations:OperationDataType[]):void {
        const incomeData:ChartObjectType = this.getDataByType(operations, 'income');
        const expensesData:ChartObjectType = this.getDataByType(operations, 'expense');
        this.renderCharts(incomeData, expensesData);
    }

   private getDataByType(operations:OperationDataType[], type:CategoryStringType):ChartObjectType {
        const filteredOperations = operations.filter(operation => operation.type === type);
        const categoriesSum:Record<string, number> = {};

        filteredOperations.forEach(operation => {
            categoriesSum[operation.category] = (categoriesSum[operation.category] || 0) + operation.amount;
        });

        const labels = Object.keys(categoriesSum);
        const data = Object.values(categoriesSum);
        const backgroundColor = ['#DC3545', '#FD7E14', '#FFC107', '#20C997', '#0D6EFD'];

        return { labels, data, backgroundColor };
    }

  private  renderCharts(incomeData:ChartObjectType, expensesData:ChartObjectType):void {
        this.destroyCharts(); // Уничтожаем старые графики

        // Создаем новые графики
        this.incomeChart = this.createChart('income-diagramma', incomeData);
        this.expensesChart = this.createChart('expenses-diagramma', expensesData);
    }

    private destroyCharts():void {
        if (this.incomeChart) {
            this.incomeChart.destroy();
            this.incomeChart = null; // Сбрасываем переменную
        }
        if (this.expensesChart) {
            this.expensesChart.destroy();
            this.expensesChart = null; // Сбрасываем переменную
        }
    }

    private createChart(canvasId: string, chartData: ChartObjectType): Chart<'pie', number[], string> | null {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null; // Обратите внимание на возможность null
        if (canvas) {
            const ctx = canvas.getContext('2d'); // Получаем контекст
            if (ctx) {
                return new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: chartData.labels,
                        datasets: [{
                            backgroundColor: chartData.backgroundColor,
                            data: chartData.data
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    color: '#000',
                                    boxWidth: 35,
                                    font: {
                                        size: 12,
                                        weight: 'bold'
                                    }
                                },
                            },
                            title: {
                                display: false,
                            }
                        }
                    }
                });
            } else {
                console.error('Не удалось получить контекст 2D для canvas.');
            }
        } else {
            console.error(`Элемент с ID "${canvasId}" не найден.`);
        }
        return null; // Возвращаем null, если не удалось создать график
    }
}

