import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import { mainRouter } from '@apis/router';
import { errorHandler } from '@middlewares/errors.middleware';


const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(mainRouter);

app.use(errorHandler)

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wallet_app_db'
mongoose.connect(MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
});

export default app;