export class NotFoundError extends Error {
	constructor(message: string) {
		super(message)
	}
}

export class PageNotFoundError extends NotFoundError {
	constructor(message: string) {
		super(message)
	}
}

export class UserNotFoundError extends NotFoundError {
	constructor(message: string) {
		super(message)
	}
}
