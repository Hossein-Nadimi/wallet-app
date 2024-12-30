export class ForbiddenError extends Error {
	constructor(message: string) {
		super(message)
	}
}

export class AccessDeniedError extends ForbiddenError {
	constructor(message: string) {
		super(message)
	}
}
