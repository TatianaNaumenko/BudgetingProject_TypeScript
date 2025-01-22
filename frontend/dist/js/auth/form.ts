import { AuthUtilsTokensType } from "../../types/auth-utils-token.type";
import { FormFieldType } from "../../types/form-field.type";
import { Methods } from "../../types/methods.type";
import { OpenNewRouteFunction } from "../../types/open-new-route-function.type";
import { ResultRequestType } from "../../types/result-request.type";
import { AuthUtils } from "../utils/auth-utils";
import { HttpUtils } from "../utils/http-utils";



export class Form {
   readonly openNewRoute: OpenNewRouteFunction;
   readonly page:'sign-up'|'login';
   readonly commonErrorElement!:HTMLElement | null;
   private fields:FormFieldType[] = [];
   private passwordElem:HTMLInputElement | null = null;
   private passwordRepeatElem: HTMLInputElement | null = null;
   private loginBtnElem:HTMLButtonElement | null = null;
   private rememberMeElem:HTMLInputElement | null = null;
   private emailElemValue:string| undefined;
   private passwordElemValue:string | undefined;
   constructor(openNewRoute:OpenNewRouteFunction, page:'sign-up'|'login') {
      this.openNewRoute = openNewRoute;
      this.page = page;
      if (AuthUtils.getAuthInfo(AuthUtilsTokensType.accessTokenKey)) {
         this.openNewRoute('/');
         return;
      }
    
      this.commonErrorElement = document.getElementById('common-error') as HTMLElement;
      this.commonErrorElement.style.display = 'none';

      this.fields = [
         {
            name: "email",
            id: "email",
            regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            valid: false,
         },
         {
            name: "password",
            id: "password",
            regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9]{8,}$/,
            valid: false,
         },
      ];

      if (this.page === 'sign-up') {
         this.fields.unshift({
            name: "name",
            id: "userName",
            regex: /^([А-ЯЁ][а-яё]+[\-\s]?){2,}$/,
            valid: false,
         });
         this.fields.push({
            name: "passwordRepeat",
            id: "passwordRepeat",
            valid: false,
         });
         this.passwordElem = document.getElementById('password') as HTMLInputElement;
         this.passwordRepeatElem = document.getElementById('passwordRepeat') as HTMLInputElement;
      }

      // Получаем элементы и добавляем обработчики событий
      this.fields.forEach(item => {
         item.element = document.getElementById(item.id) as HTMLInputElement | null;
         if (item.element) {
            item.element.addEventListener('change', () => {
               this.validateInput(item);
            });
         }
      });

      this.loginBtnElem = document.getElementById("loginBtn") as HTMLButtonElement;
      if (this.loginBtnElem) {
         this.loginBtnElem.addEventListener('click', (e:Event) => {
            e.preventDefault();
            this.processForm();
         });
      }

      if (this.page === 'login') {
         this.rememberMeElem = document.getElementById("RememberMe") as HTMLInputElement;
      }
   }

  private validateInput(field:FormFieldType):void {
      const elem = field.element as HTMLInputElement;
      if (!elem.value ||(field.regex && !elem.value.match(field.regex))) {
         elem.classList.add('is-invalid');
         field.valid = false;
      } else {
         elem.classList.remove('is-invalid');
                field.valid = true;
      }

      // Дополнительная проверка для страницы регистрации
      if (this.page === 'sign-up' && field.name === 'passwordRepeat') {
         if(this.passwordElem && this.passwordRepeatElem){
            if (this.passwordElem.value !== this.passwordRepeatElem.value) {
               this.passwordRepeatElem.classList.add('is-invalid');
               field.valid = false;
            } else {
               this.passwordRepeatElem.classList.remove('is-invalid');
               field.valid = true;
            }
         }
         
      }
   }

   private validateForm():boolean {
      return this.fields.every(item => item.valid); // попадут толко поля где valid true
   }

   private async processForm(): Promise<void> {
      if (!this.validateForm()) {
         this.showError('Заполните корректно поля формы!');
         return;
      }
      const emailField = this.fields.find(item => item.name === 'email');
      const passwordField = this.fields.find(item => item.name === 'password');
      if (emailField?.element && passwordField?.element) {
         this.emailElemValue = emailField.element.value;
         this.passwordElemValue = passwordField.element.value;
     }



      try {
         if (this.page === 'sign-up') {
        
            await this.handleSignUp();
         } else if (this.page === 'login') {
            await this.handleLogin();
         }
      } catch (error) {
         console.error(error);
         this.showError('Пользователь с таким адресом уже существует');
      }
   }
   private async handleSignUp(): Promise<void> {
      const nameField = this.fields.find(item => item.name === 'name');
      const passwordRepeatField = this.fields.find(item => item.name === 'passwordRepeat');
  
      // Проверяем, что поля существуют
      if (!nameField || !nameField.element || !passwordRepeatField || !passwordRepeatField.element) {
          this.showError('Пожалуйста, заполните все обязательные поля.');
          return;
      }
  
      // Получаем значения
      const fullName = nameField.element.value;
      const [name, lastName] = fullName.split(" ");
      const passwordRepeat = passwordRepeatField.element.value;
  
      const result:ResultRequestType = await HttpUtils.request('/signup', Methods.post, false, {
          name,
          lastName,
          email: this.emailElemValue,
          password: this.passwordElemValue,
          passwordRepeat
      });
  
      // Проверка на ошибки
      if (this.hasError(result)) {
          this.showError('Не удалось зарегистрировать пользователя. Обратитесь в поддержку');
          throw new Error(result.response.message);
      }
  
      // Установка информации об аутентификации
      AuthUtils.setAuthInfo(null, null, {
          name: result.response.user.name,
          email: result.response.user.email,
          lastName: result.response.user.lastName,
          id: result.response.user.id
      });
  
      // Перенаправление
      this.openNewRoute('/login');
  }


  private async handleLogin():Promise<void> {
      const result:ResultRequestType = await HttpUtils.request('/login', Methods.post, false, {
         email: this.emailElemValue,
         password: this.passwordElemValue,
         rememberMe: this.rememberMeElem ? this.rememberMeElem.checked : false 
      });

      if (this.hasError(result)) {
         this.showError('Не удалось войти в систему.');
         throw new Error(result.response.message);
      }

      AuthUtils.setAuthInfo(result.response.tokens.accessToken, result.response.tokens.refreshToken, {
         name: result.response.user.name,
         email: result.response.user.email,
         lastName: result.response.user.lastName,
         id: result.response.user.id
      });

      this.openNewRoute('/');
   }

 private  hasError(result:ResultRequestType):boolean {
      const response = result.response;
      return result.error || !response
   }
// хочу чтобы текст блока менялся ы зависимости от ошибки 
 private  showError(message:string): void {
      if(this.commonErrorElement){
         this.commonErrorElement.innerText = message;
         this.commonErrorElement.style.display = 'block';
      }
      
   }
}
