export class BadRequestError extends Error {
	constructor(message: string) {
		super(message)
	}
}

export class InvalidDataError extends BadRequestError {
	constructor(message: string) {
		super(message)
	}
}
