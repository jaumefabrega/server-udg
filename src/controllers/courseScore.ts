'use strict';
import { NextFunction, Response } from 'express';
import { Auth0Request, User } from '../interfaces';
import { AppError } from '../middlewares/errorHandling/appError';
import { StatusCode } from '../utils/httpCodes';
import { catchAsync } from '../utils/catchAsync';

import {
  PASSWORD_MIN_LENGTH,
  PW_HASH_SALT_ROUNDS,
  USER_TYPE_STUDENT,
  USER_TYPE_TEACHER,
} from '../constants';

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../models');

// FIX: TODO: REALTODO: needs to be tested, developed without running the project
exports.postCourseScore = catchAsync(
  async (req: Auth0Request, res: Response, next: NextFunction) => {
    if (req.user.type === USER_TYPE_STUDENT) {
      return next(
        new AppError({
          statusCode: StatusCode.FORBIDDEN,
          description: 'Only teachers can post course scores',
        }),
      );
    }

    const { id, ...scores } = req.body;

    const courseScore = await db.courseScore.findOne({
      where: { id }, // FIX: TODO: only teachers with abps in the course should give course note? (but also reflect in front!)
    });

    if (!courseScore) {
      return next(
        new AppError({
          statusCode: StatusCode.FORBIDDEN,
          description: 'You are not a teacher of this course',
        }),
      );
    }

    courseScore.score1 = scores.score1;
    courseScore.score2 = scores.score2;
    courseScore.score3 = scores.score3;
    const updatedCourseScore = await courseScore.save();

    res.status(204);
    res.send(updatedCourseScore);
  },
);
