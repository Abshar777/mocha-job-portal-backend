import type { NextFunction, Request, Response } from "express";

export const notFound=(req:Request,res:Response,next:NextFunction)=>{
    const error=new Error(`note Found - ${req.originalUrl}`);
    console.log(`note Found - ${req.originalUrl}`)
    res.status(404);
    next(error);
}


export const errorHandler=(err:Error,req:Request,res:Response,next:NextFunction)=>{
    let statusCode=res.statusCode==200?500:res.statusCode;
    let message=err.message;

    if(err.name==="CastError" && (err as any).kind==="ObjectId"){
        statusCode=404;
        message="Note not found";
    }

    res.status(statusCode).json({
        message,
        stack:process.env.NODE_ENV==='production'?null:err.stack
    })

}