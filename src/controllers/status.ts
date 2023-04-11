'use strict';
import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';

exports.getStatus = catchAsync(async (req: Request, res: Response) => {
  res.status(200).send('UDG app is up and running');
});
