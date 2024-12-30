import { IUser } from '@data/interfaces/apmInterfaces/user.interface'
import { IRealtor } from '@data/interfaces/psInterfaces/realtor.interface'

declare global {
    namespace Express {
        interface Request {
            responseStatusCode?: number
            responseStatus?: boolean
            responseData?: object
            responseMessage?: string
            returnList?: boolean
        }
    }
}
