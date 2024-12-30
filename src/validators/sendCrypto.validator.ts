import { InvalidDataError } from '@errors/badRequestError.error'
import Joi from 'joi'

export const sendCryptoDataValidator = async (data: any) => {
    data = JSON.parse(JSON.stringify(data))

    const validatorSchema = {
        fromAddress: Joi.string().trim().required().error(new InvalidDataError('Please provide a valid sender address.')),
        toAddress: Joi.string().trim().error(new InvalidDataError('Please provide a valid recipient address.')),
        amount: Joi.number().positive().required().error(new InvalidDataError('Please provide a valid amount.')),
    }

    const sendCryptoSchema = Joi.object(validatorSchema).options({ allowUnknown: true })

    try {
        return await sendCryptoSchema.validateAsync(data)
    } catch (error) {
        if (error instanceof InvalidDataError) throw error
        throw new InvalidDataError('Your data is invalid!')
    }
}
