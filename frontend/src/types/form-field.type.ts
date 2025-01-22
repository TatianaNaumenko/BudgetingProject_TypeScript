export type FormFieldType = {
   name: string,
   id: string,
   regex?:RegExp,
   valid: boolean,
   element?: HTMLInputElement | null;
}