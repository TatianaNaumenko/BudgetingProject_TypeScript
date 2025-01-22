import { Form } from "./js/auth/form";
import { MainChart } from "./js/chart/mainChart";
import { CreateCategory } from "./js/common/create-category";
import { CreateExpense } from "./js/expense/create-expense";
import { EditExpense } from "./js/expense/edit-expense";

import { CreateIncomeExpenseInIncomeExpense } from "./js/income-expense/create-income-expense-in-income-expense";
import { DeleteIncomeExpense } from "./js/income-expense/delete-income-expense";
import { EditIncomeExpense } from "./js/income-expense/edit-income-expense";
import { IncomeExpenses } from "./js/income-expense/income-expense";
import { CreateIncome } from "./js/income/create-income";
import { EditIncome } from "./js/income/edit-income";
import { AuthUtils } from "./js/utils/auth-utils";
// import { HttpUtils } from "./js/utils/http-utils";
import { Sidebar } from "./js/utils/sidebar-utils";
import { BalanceService } from "./js/sevice/balance-service";
import { AuthUtilsTokensType } from "./types/auth-utils-token.type";
import { UserInfoType } from "./types/user-info.type";
import { RouteType } from "./types/route.type";



export class Router {
   readonly contentElement: HTMLElement | null;
   readonly titlePageElement: HTMLElement | null;
   private contentLayoutElement: HTMLElement | null;
   private headerTitleElem: HTMLElement | null;
   private layoutPath: string;
   private balanceElem: HTMLElement | null;

   private routes: RouteType[];
   constructor() {
      this.contentElement = document.getElementById('content');
      this.titlePageElement = document.getElementById('title-page');
      this.contentLayoutElement = null;
      this.headerTitleElem = null;
      this.layoutPath = '/templates/layout.html';
      this.balanceElem = null;

      this.routes = [
         {
            route: '/',
            title: 'Главная',
            template: '/templates/pages/mainChart.html',
            useLayout: this.layoutPath,
            load: () => {
               new MainChart(this.openNewRoute.bind(this));
            }
         },

         {
            route: '/login',
            title: 'Авторизация',
            template: '/templates/pages/auth/login.html',
            useLayout: false,
            load: () => {
               new Form(this.openNewRoute.bind(this), 'login');
            }
         },
         {
            route: '/sign-up',
            title: 'Регистрация',
            template: '/templates/pages/auth/sign-up.html',
            useLayout: false,
            load: () => {
               new Form(this.openNewRoute.bind(this), 'sign-up');
            }
         },

         {
            route: '/incomes-expenses',
            title: ' Доходы & Расходы',
            template: '/templates/pages/income-expense/incomes-expenses.html',
            useLayout: this.layoutPath,
            load: () => {
               new IncomeExpenses(this.openNewRoute.bind(this));
            },
         },
         {
            route: '/edit-income-expense',
            title: 'Редактирование дохода/расхода',
            template: '/templates/pages/income-expense/edit-income-expense.html',
            useLayout: this.layoutPath,
            load: () => {
               new EditIncomeExpense(this.openNewRoute.bind(this))
            }
         },
         {
            route: '/delete-income-expense',
            load: () => {
               new DeleteIncomeExpense(this.openNewRoute.bind(this))
            }
         },
         {
            route: '/expenses',
            title: 'Расходы',
            template: '/templates/pages/expense/expenses.html',
            useLayout: this.layoutPath,
            load: () => {
               new CreateCategory(this.openNewRoute.bind(this), 'expense')
            },

         },
         {
            route: '/create-expense',
            title: 'Создание категории расходов',
            template: '/templates/pages/expense/create-expenses-category.html',
            useLayout: this.layoutPath,
            load: () => {
               new CreateExpense(this.openNewRoute.bind(this))
            }
         },
         {
            route: '/edit-expense',
            title: 'Редактирование расхода',
            template: '/templates/pages/expense/edit-expenses-category.html',
            useLayout: this.layoutPath,
            load: () => {
               new EditExpense(this.openNewRoute.bind(this))
            }
         },
         {
            route: '/incomes',
            title: ' Доходы',
            template: '/templates/pages/income/incomes.html',
            useLayout: this.layoutPath,
            load: () => {
               new CreateCategory(this.openNewRoute.bind(this), 'income')
            }
         },
         {
            route: '/create-income',
            title: ' Создание категории доходов',
            template: '/templates/pages/income/create-incomes-category.html',
            useLayout: this.layoutPath,
            load: () => {
               new CreateIncome(this.openNewRoute.bind(this))
            }
         },
         {
            route: '/edit-income',
            title: 'Редактирование дохода',
            template: '/templates/pages/income/edit-incomes-categoty.html',
            useLayout: this.layoutPath,
            load: () => {
               new EditIncome(this.openNewRoute.bind(this))
            }
         },
         {
            route: '/create-expense-in-income-expense',
            title: 'Создание дохода/расхода',
            template: '/templates/pages/income-expense/create-income-expense.html',
            useLayout: this.layoutPath,
            load: () => {
               new CreateIncomeExpenseInIncomeExpense(this.openNewRoute.bind(this), 'expense')
            }
         },

         {
            route: '/create-income-in-income-expense',
            title: 'Создание дохода/расхода',
            template: '/templates/pages/income-expense/create-income-expense.html',
            useLayout: this.layoutPath,
            load: () => {
               new CreateIncomeExpenseInIncomeExpense(this.openNewRoute.bind(this), 'income')
            }
         },


      ]
      this.initEvents();
   }
   private initEvents(): void {
      window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this));
      window.addEventListener('popstate', this.activateRoute.bind(this));
      document.addEventListener('click', this.clickHandler.bind(this));
   }

   public async openNewRoute(url: string): Promise<void> {
      const currentRoute: string = window.location.pathname;
      history.pushState({}, '', url);

      try {
         // Активируем новый маршрут
         await this.activateRoute(null, currentRoute);
      } catch (error) {
         console.error('Ошибка активации маршрута:', error);
      }
   }

   private async clickHandler(e: MouseEvent): Promise<void> {
      let element: HTMLAnchorElement | null = null;

      // Проверяем, является ли целевой элемент ссылкой
      if (e.target instanceof HTMLAnchorElement) {
         element = e.target;
      } else if (e.target instanceof HTMLElement && e.target.parentNode instanceof HTMLAnchorElement) {
         element = e.target.parentNode as HTMLAnchorElement; // Приводим к HTMLAnchorElement
      }

      if (element) {
         e.preventDefault(); // Отменяем стандартное поведение

         const currentRoute: string = window.location.pathname;
         const url: string = element.getAttribute('href')?.replace(window.location.origin, '') || '';

         // Проверяем условия для продолжения
         if (!url || (currentRoute === url.replace('#', '')) || url.startsWith('javascript:void(0)')) {
            return;
         }

         await this.openNewRoute(url); // Переход к новому маршруту
      }
   }



   private async activateRoute(param1?: any, param2?: string): Promise<void> {

      const urlRoute: string = window.location.pathname;
      const newRoute: RouteType | undefined = this.routes.find(item => item.route === urlRoute); // это обект с данными маршрута

      if (newRoute) {
         if (newRoute.title && this.titlePageElement) {
            this.titlePageElement.innerText = `${newRoute.title} | Lumincoin Finance`;
         }


         if (newRoute.template) {

            if (newRoute.useLayout) {

               if (this.contentElement) {
                  this.contentElement.innerHTML = await fetch(newRoute.useLayout as string).then(response => response.text())
               }

               this.contentLayoutElement = document.getElementById('content-layout');
               const userNameElement: HTMLElement | null = document.getElementById('userName');
               const logOutElement: HTMLElement | null = document.getElementById('logOut');
               this.headerTitleElem = document.getElementById('header-title');
               if (this.headerTitleElem && newRoute.title) {
                  this.headerTitleElem.innerText = newRoute.title;
               }

               this.balanceElem = document.getElementById('balance-amount');
               new Sidebar();

               let userInfo: string | null = AuthUtils.getAuthInfo(AuthUtilsTokensType.userInfoKey);// не знаю как тут сделать поэтому any
               if (userInfo) {
                  const profileName: UserInfoType | null = JSON.parse(userInfo);
                  if (profileName && userNameElement) {

                     userNameElement.innerText = profileName.name + ' ' + profileName.lastName

                  };

               } else {
                  location.href = '/login'
               }
               // обработадла выход из приложения
               if (logOutElement) {
                  logOutElement.addEventListener('click', (e) => {
                     e.preventDefault();
                     AuthUtils.removeAuthInfo();
                     location.href = '/login'
                  })
               };

               this.setBalance().then();
               this.activateLink('.main-menu-item');
               let menuDropdownLink = document.getElementById('menu-dropdown-link');
               if (menuDropdownLink) {
                  menuDropdownLink.addEventListener('click', (e) => {
                     e.preventDefault();
                     menuDropdownLink.classList.add('active');
                     this.activateLink('.menu-dropdown-item');


                  });

               }
               if (this.contentLayoutElement) {
                  this.contentLayoutElement.innerHTML = await fetch(newRoute.template).then(response => response.text());
               }


            } else {
               // Если useLayout false, загружаем только шаблон
               if (this.contentElement) {
                  this.contentElement.innerHTML = await fetch(newRoute.template).then(response => response.text());
               }


            }

         }

         if (newRoute.load && typeof newRoute.load === 'function') {
            newRoute.load();

         };

      }

      else {
         console.log("route not found");
         // Проверяем, если пользователь уже на странице входа
         if (urlRoute !== '/login') {
            history.pushState({}, '', '/login');

         };

      }
   }



   private async setBalance(): Promise<void> {
      const balanceService = new BalanceService(this.openNewRoute.bind(this));
      await balanceService.requestBalance(); // Запросите баланс
      if (this.balanceElem) {
         this.balanceElem.innerText = `${balanceService.balance}$`;
      }

   }

   private activateLink(elemClass: string): void {
      let currentlocation: string = window.location.pathname;
      let menuLinks: NodeListOf<HTMLAnchorElement> = document.querySelectorAll(elemClass);
      menuLinks.forEach((link) => {
         let linkHref: string | null = link.getAttribute('href');
         if (linkHref === currentlocation) {
            link.classList.add('active');

         } else {
            link.classList.remove('active');
         }

      })
   }


}
