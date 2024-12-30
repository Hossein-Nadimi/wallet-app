import { IWallet } from '@data/interfaces/wallet.interface';
import { WalletSchema } from '@data/schemas/wallet.schema';
import mongoose from 'mongoose';

export const WalletModel = mongoose.model<IWallet>('Wallet', WalletSchema);