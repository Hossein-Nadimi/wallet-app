import { Router } from 'express'
import { walletRouter } from './wallet.router'
const router: Router = Router()

// wallet router
router.use('/wallets', walletRouter)

export const mainRouter = router
