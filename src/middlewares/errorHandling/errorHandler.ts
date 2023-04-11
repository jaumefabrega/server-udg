const fs = require('fs');
import { Request, Response, NextFunction } from 'express';
import { IncomingHttpHeaders } from 'http';

const { NODE_ENV } = process.env;

import { AppError } from './appError';
import { StatusCode, StatusMessage } from '../../utils/httpCodes';

type RequestInfo = {
  path: string;
  method: string;
  headers: IncomingHttpHeaders;
  body: string;
  userId?: number;
};

type ErrorToRecord = {
  timeStamp?: Date;
  error?: string;
  request: RequestInfo;
};

const isTrustedError = (error: Error | AppError): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

const handleTrustedError = (error: AppError, res: Response): void => {
  res.status(error.statusCode).json({
    statusCode: error.statusCode,
    message: error.message,
    ...(NODE_ENV === 'development' && { description: error.description }),
  });
};

const buildReqInfo = (req: Request) => {
  const { path, method, headers, body } = req;
  delete headers.authorization;
  return {
    path,
    method,
    headers,
    body,
    // FIX: it would be useful to add: userId: req.user.id, Typescript complains
  };
};

const recordError = (errorToRecord: ErrorToRecord, statusCode = '500') => {
  const { method = 'no-method' } = errorToRecord.request;
  const BASE_PATH = 'errors/';
  errorToRecord.timeStamp = new Date();
  const fileName = `${BASE_PATH}${Date.now()}-${method}-${statusCode}.json`;

  fs.writeFile(fileName, JSON.stringify(errorToRecord), (err: Error) => {
    if (err) {
      console.error(err);
    }
  });
};

const handleUntrustedError = (
  error: Error | AppError,
  req: Request,
  res?: Response,
): void => {
  if (res) {
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: StatusMessage.INTERNAL_SERVER_ERROR });
  }

  const reqInfo = buildReqInfo(req);
  const errorToRecord = {
    error: error.stack,
    request: reqInfo,
  };

  if (NODE_ENV === 'development') {
    console.log(errorToRecord);
  } else if (NODE_ENV === 'production') {
    recordError(errorToRecord);
    // TODO: NOTIFY ADMINS
  }
  // process.exit(1);
  // Exit application
  // Restart
};

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  if (isTrustedError(err) && res) {
    handleTrustedError(err, res);
  } else {
    handleUntrustedError(err, req, res);
  }
  res.send();
}
