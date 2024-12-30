import { InternalServerFunctionalityError } from '@errors/InternalServerFunctionalityError.error'
import { BadRequestError } from '@errors/badRequestError.error'
import { ConflictError } from '@errors/conflictError.error'
import { ForbiddenError } from '@errors/forbiddenError.error'
import { NotFoundError, PageNotFoundError } from '@errors/notFoundError.error'
import { WalletService } from '@services/wallet.service'
import { httpResponseFunction } from '@utils/helperFunctions'
import clc from 'cli-color'
import { NextFunction, Request, Response } from 'express'

export const pageNotFoundError = (req: Request, res: Response) => {
	req
	res
	throw new PageNotFoundError('Not Found!')
}

export const errorMiddleware = (err: Error & { status: number }, _: Request, __: Response, next: NextFunction) => {
	switch (true) {
		case err instanceof BadRequestError:
			err.status = 400
			break
		case err instanceof ForbiddenError:
			err.status = 403
			break
		case err instanceof NotFoundError:
			err.status = 404
			break
		case err instanceof ConflictError:
			err.status = 409
			break
		case err instanceof InternalServerFunctionalityError:
			err.status = 503
			break
		default:
			err.status = 500
	}

	return next(err)
}

export const errorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
	console.log(
		clc.red(
			JSON.stringify(
				{
					status: false,
					error: err.constructor.name,
					message: err.message,
					stack: err.stack,
					messages: err.messages,
				},
				null,
				2
			)
		)
	)

	const responseData = {
		error: err.constructor.name,
		stack: process.env.NODE_ENV === 'production' ? null : err.stack,
	}

	next
	return httpResponseFunction(req, res, err?.status || 500, false, responseData, err.message)
}
