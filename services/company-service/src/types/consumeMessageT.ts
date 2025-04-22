import { ObjectId } from "mongoose";
export type TPayload<T>={
    event:string,
    message:{
        data:T 
    }
}


export interface DocumentWithId {
  _id?: string | ObjectId | undefined;
}