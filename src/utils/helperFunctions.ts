import { Request, Response } from "express";

export async function httpResponseFunction(
    request: Request,
    response: Response,
    statusCode = 200,
    status = true,
    data: any = {},
    message = ''
): Promise<any> {
    return response.status(statusCode).json({
        statusCode: request.responseStatusCode || statusCode,
        status: request.responseStatus || status,
        data: request.responseData || data,
        message: request.responseMessage || message,
    })
}