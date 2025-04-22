import type { Response } from "express";
import { StatusCode, StatusMessages } from "../constants/api";

interface ResponseData {
    success: boolean;
    message: string;
    data?: any;
    token?: string;
    refreshToken?: string;
}

export const sendResponse = (
    res: Response,
    statusCode: StatusCode,
    message: string,
    data?: any,
    token?: string,
    refreshToken?: string
) => {
    const responseData: ResponseData = {
        success: statusCode < 400,
        message,
    };

    if (data) responseData.data = data;
    if (token) responseData.token = token;
    if (refreshToken) responseData.refreshToken = refreshToken;

    return res.status(statusCode).json(responseData);
};

export const sendError = (
    res: Response,
    statusCode: StatusCode = StatusCode.INTERNAL_SERVER_ERROR,
    message: string = StatusMessages.INTERNAL_SERVER_ERROR
) => {
    return sendResponse(res, statusCode, message);
};

export const sendSuccess = (
    res: Response,
    data?: any,
    message: string = StatusMessages.SUCCESS,
    token?: string,
    refreshToken?: string
) => {
    return sendResponse(res, StatusCode.SUCCESS, message, data, token, refreshToken);
};

export const sendCreated = (
    res: Response,
    data?: any,
    message: string = StatusMessages.CREATED,
    token?: string
) => {
    return sendResponse(res, StatusCode.CREATED, message, data, token);
}; 