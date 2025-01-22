import { CategoryStringType } from "./category-string.type";

export type OperationDataType = {
   id: number;
   type: CategoryStringType;
   category: string;
   amount: number;
   date: string;
   comment: string;
   category_id?:number
}