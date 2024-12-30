import { WalletModel } from "@data/models/wallet.model";
import { InvalidDataError } from "@errors/badRequestError.error";
import { InternalServerFunctionalityError } from "@errors/InternalServerFunctionalityError.error";
import { NotFoundError } from "@errors/notFoundError.error";
import { confirmTransaction, createWalletFunction, fundWalletFunction, getWalletBalanceFunction, getWalletFunction, sendBTC, validateAddressFunction } from "@utils/blockcypher";
import { httpResponseFunction } from "@utils/helperFunctions";
import { sendCryptoDataValidator } from "@validators/sendCrypto.validator";
import autoBind from "auto-bind";
import { Request, Response } from "express";
import QRCode from 'qrcode';

class WalletServiceClass {
    constructor() {
        autoBind(this);
    }

    async getWalletsListService(req: Request, res: Response) {
        const wallets = await WalletModel.find().select('-privateKey');

        return httpResponseFunction(req, res, 200, true, wallets);
    }

    async getWalletByIdService(req: Request, res: Response) {
        const wallet = await WalletModel.findById(req.params.id).select('-privateKey').lean();

        if (!wallet) throw new NotFoundError('Wallet not found')

        // const walletBalance = await getWalletBalanceFunction(wallet?.address)

        return httpResponseFunction(req, res, 200, true, wallet);
    }

    async createWalletService(req: Request, res: Response) {
        const { name, balance } = req.body

        if (!name || !balance) throw new InvalidDataError('Please provide both name and balance.')

        // Create wallet in blockchain
        const wallet = await createWalletFunction()
        if (!wallet) throw new InternalServerFunctionalityError('Error creating wallet.');

        // Fund wallet
        const funded = await fundWalletFunction(wallet.address, balance)
        if (!funded) throw new InternalServerFunctionalityError('Error funding wallet.');

        // Create qr code image
        const qrCode = await QRCode.toDataURL(wallet.address);

        // Create wallet in DB
        const newWallet = await WalletModel.create({
            name,
            address: wallet.address,
            privateKey: wallet.private,
            balance: balance,
            qrCode
        })
        if (!newWallet) throw new InternalServerFunctionalityError('Error creating wallet.');

        return httpResponseFunction(req, res, 201, true, {}, 'Wallet created successfully!');
    }

    async searchWalletByAddressService(req: Request, res: Response) {
        const { address } = req.params;

        // Validate address
        if (!address || !(await validateAddressFunction(address))) {
            throw new InvalidDataError('Please provide a valid address.');
        }

        const wallet = await WalletModel.findOne({ address }).lean()

        const thirtySecondsAgo = new Date(Date.now() - 30000);
        if (!wallet || (wallet.lastQueried && wallet.lastQueried < thirtySecondsAgo)) {
            const foundWallet = await getWalletFunction(address)

            return httpResponseFunction(req, res, 200, true, { wallet: { address: foundWallet.address, balance: foundWallet.balance, ...wallet } });
        }

        await WalletModel.updateOne({ address }, { lastQueried: new Date() });

        return httpResponseFunction(req, res, 200, true, wallet);
    }

    async sendCryptoService(req: Request, res: Response) {
        const { fromAddress, toAddress, amount } = req.body;

        // validate data 
        await sendCryptoDataValidator(req.body)
        if (fromAddress === toAddress) throw new InvalidDataError("The sender and receiver can't be the same wallet")

        // validate sender's wallet
        const wallet = await WalletModel.findOne({ address: fromAddress }).lean()
        if (!wallet) throw new InvalidDataError("You don't own this wallet!")

        // validate sender's balance
        const walletBalance = await getWalletBalanceFunction(fromAddress)
        if (walletBalance && amount > walletBalance) throw new InvalidDataError('Insufficient balance to complete the transaction.');

        // create transaction
        const transaction = await sendBTC(fromAddress, toAddress, amount, wallet.privateKey);
        if (!transaction) throw new InternalServerFunctionalityError('Error occurred!')

        // update senders balance
        await WalletModel.updateOne({ address: fromAddress }, {
            $set: { balance: wallet.balance - amount },
            $push: {
                transactions: {
                    txHash: transaction.hash,
                    status: transaction.hash ? true : false,
                    fees: transaction.fees,
                    toAddress,
                    amount,
                }
            }
        })

        // update receiver balance
        const receiverWallet = await WalletModel.findOne({ address: toAddress })
        if (receiverWallet) {
            await WalletModel.updateOne({ _id: receiverWallet._id }, { $set: { balance: receiverWallet.balance + amount } })
        }

        // send response
        return httpResponseFunction(req, res, 200, true, { transaction }, 'Transaction sent successfully');
    }

    async checkTransactionByHashId(req: Request, res: Response) {
        const { txHash } = req.params

        // check transaction status
        const transaction = await confirmTransaction(txHash);

        return httpResponseFunction(req, res, 200, true, transaction)
    }
}

export const WalletService = new WalletServiceClass()
