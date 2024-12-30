import { Schema } from 'mongoose';

export const WalletSchema: Schema = new Schema({
    name: { type: String },
    address: { type: String, required: true, unique: true },
    privateKey: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
    qrCode: { type: String },
    lastQueried: { type: Date, default: Date.now },
    transactions: [{
        toAddress: { type: String },
        amount: { type: Number },
        txHash: { type: String },
        status: { type: Boolean },
        fees: { type: Number }
    }]
}, {
    id: false,
    versionKey: false,
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
});