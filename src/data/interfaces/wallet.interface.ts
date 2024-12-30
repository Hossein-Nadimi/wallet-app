export interface IWallet {
  name: string;
  _id: string;
  address: string;
  privateKey: string;
  balance: number;
  qrCode: string;
  createdAt: Date;
  updatedAt: Date;
  lastQueried: Date;
  transactions: {
    toAddress: string
    amount: number
    txHash: string
    status: boolean
    fees: number
  }[]
}
