import express from 'express';
import mongoose from 'mongoose';
import { errors } from 'celebrate';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import userRouter from './routes/users';
import cardRouter from './routes/cards';
import auth from './middlewares/auth';
import UserController from './controllers/users';
import errorHandler from './middlewares/errorHandler';
import limiter from './middlewares/rateLimiter';
import { requestLogger, errorLogger } from './middlewares/logger';
import NotFoundError from './errors/notFoundError';
import * as dotenv from 'dotenv';
import CONFIG from './config';

dotenv.config();
const app = express();

app.use(limiter);
app.use(cookieParser());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.post('/signup', UserController.createUser);
app.post('/signin', UserController.login);
console.log();
app.use(auth);
app.use('/', userRouter);
app.use('/', cardRouter);

app.use('*', () => {
  throw new NotFoundError('Страница не найдена');
});

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

async function startApp() {
  try {
    await mongoose.connect(CONFIG.MONGO_URI);
    app.listen(CONFIG.PORT, () => {
      console.log('server start on', '\x1b[36m', `http://localhost:${CONFIG.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

startApp();
