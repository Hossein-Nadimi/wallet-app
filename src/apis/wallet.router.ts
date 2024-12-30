import { WalletService } from '@services/wallet.service';
import { Router } from 'express'
require('express-async-errors')
const router: Router = Router()

// Get wallets
router.get('/', WalletService.getWalletsListService);

// Search wallet by id
router.get('/search/:address', WalletService.searchWalletByAddressService);

// Create a wallet
router.post('/create', WalletService.createWalletService);

// Send crypto
router.post('/send', WalletService.sendCryptoService)

// Check transaction hash
router.get('/check/:txHash', WalletService.checkTransactionByHashId)

// Get wallet by id
router.get('/:id', WalletService.getWalletByIdService);

export const walletRouter = router
