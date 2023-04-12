'use strict';
require('dotenv').config();

import express, { Application } from 'express';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandling/errorHandler';
import { AppError } from './middlewares/errorHandling/appError';
import { StatusCode, StatusMessage } from './utils/httpCodes';
import helmet from 'helmet';

// TODO: move configuration to config folder, eg. morgan, cors, etc

const app: Application = express();

const cors = require('cors');
const db = require('./models');
const router = require('./router');

const {
  PORT = 3001,
  CLIENT_PORT = '3000',
  CLIENT_HOST = 'localhost',
  NODE_ENV,
} = process.env;

const corsConfig = {
  origin: `https://${CLIENT_HOST}`,
  credentials: true,
};

// FIX: TODO: improvements in project:
//    - better response codes
//    - request validations (sinclair + ajv) (assert!)
//    - security audit
//    - user creation/validation (uuidv4 + isVerified virtual field + add it in all controllers)
//    - send emails
//    - convert all .js to .ts
if (NODE_ENV === 'development') {
  morgan.format(
    'myFormat',
    ':date[iso] :method ":url" :status :res[content-length] - :response-time ms',
  );
  app.use(morgan('myFormat'));
}
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsConfig));

app.use('/', router);
app.use((req, res, next) => {
  next(
    new AppError({
      statusCode: StatusCode.NOT_FOUND,
      description: StatusMessage.NOT_FOUND,
    }),
  );
});
app.use(errorHandler);

(async function () {
  try {
    await db.sequelize.sync({ alter: true });
    app.listen(PORT, () =>
      console.log(
        `Server listening at http://localhost:${PORT} with env=${NODE_ENV}`,
      ),
    );
  } catch (error) {
    console.error('Error while bootstrapping:', error); // eslint-disable-line no-console
  }
})();
