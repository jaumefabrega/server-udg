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
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');

const { JWT_SECRET_KEY, ADMIN_PASSWORD } = process.env;

exports.dummy = catchAsync(
  async (req: Auth0Request, res: Response, next: NextFunction) => {
    res.status(200);
    res.send('yes it works');
  },
);

exports.createUser = catchAsync(
  async (req: Auth0Request, res: Response, next: NextFunction) => {
    const { email, adminPassword, name, type } = req.body;

    // FIX: todo: validate incoming request data (assertUserIsValid)
    // if (false) {
    //   return next(
    //     new AppError({
    //       statusCode: StatusCode.BAD_REQUEST,
    //       description: reqValidation.errors,
    //     }),
    //   );
    // }
    if (adminPassword !== ADMIN_PASSWORD) {
      return next(
        new AppError({
          statusCode: StatusCode.FORBIDDEN,
          description: 'You must be an admin',
        }),
      );
    }
    const existingUser: User = await db.user.findOne({
      where: { email },
    });

    if (existingUser) {
      // TODO: send security email
      return next(
        new AppError({
          statusCode: StatusCode.CONFLICT,
          description: 'User already exists',
        }),
      );
    }

    const dbUser = await db.user.create({ email, name, type });
    res.status(201);
    res.send(dbUser);
  },
);

// FIX: TODO: login should be moved to a function used in 2 places: register and login
exports.getUserToConfirm = catchAsync(
  async (req: Auth0Request, res: Response, next: NextFunction) => {
    const { registrationUUID } = req.query;
    // FIX: TODO: assertRegistrationUUID format
    const existingUserToConfirm: User = await db.user.findOne({
      where: { registrationUUID, hasConfirmed: false },
    });
    // console.log(existingUserToConfirm.toJSON());

    if (!existingUserToConfirm) {
      // TODO: send security email
      return next(
        new AppError({
          statusCode: StatusCode.NOT_FOUND,
          description: 'User to confirm not found',
        }),
      );
    }

    console.log('found ...eeeh...', existingUserToConfirm);

    res.status(200).send({
      email: existingUserToConfirm.email,
      name: existingUserToConfirm.name,
    });
  },
);

// FIX: TODO: login should be moved to a function used in 2 places: register and login
exports.confirmUser = catchAsync(
  async (req: Auth0Request, res: Response, next: NextFunction) => {
    const { password, registrationUUID } = req.body;

    const existingUserToConfirm: User = await db.user.findOne({
      where: { registrationUUID, hasConfirmed: false },
    });

    if (!existingUserToConfirm) {
      // TODO: send security email
      return next(
        new AppError({
          statusCode: StatusCode.NOT_FOUND,
          description: 'User to confirm not found',
        }),
      );
    }

    const hash = await bcrypt.hash(password, PW_HASH_SALT_ROUNDS);

    existingUserToConfirm.password = hash;
    existingUserToConfirm.hasConfirmed = true;

    await existingUserToConfirm.save();

    const accessToken = jwt.sign(
      { id: existingUserToConfirm.id },
      JWT_SECRET_KEY,
    );

    console.log('found', existingUserToConfirm);
    res.status(200).send({
      token: accessToken,
      email: existingUserToConfirm.email,
      name: existingUserToConfirm.name,
      id: existingUserToConfirm.id,
      type: existingUserToConfirm.type,
    });
  },
);

exports.login = catchAsync(
  async (req: Auth0Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user: User = await db.user.findOne({
      where: { email, hasConfirmed: true },
    });
    if (!user) {
      return next(
        new AppError({
          statusCode: StatusCode.NOT_FOUND,
          description: 'No verified user with this email',
        }),
      );
    }
    const validatedPass = await bcrypt.compare(password, user.password);
    if (!validatedPass) {
      return next(
        new AppError({
          statusCode: StatusCode.UNAUTHORIZED,
          description: 'Username or password is incorrect', //
        }),
      );
    }
    const accessToken = jwt.sign({ id: user.id }, JWT_SECRET_KEY);
    res.status(200).send({
      token: accessToken,
      email: user.email,
      name: user.name,
      id: user.id,
      type: user.type,
    });
  },
);

// TODO
// eslint-disable-next-line @typescript-eslint/no-unused-vars
exports.logout = catchAsync(async (req: Auth0Request, res: Response) => {
  // delete the token client side upon logout.
  // you would invalidate the token here.
});

exports.getStudents = catchAsync(
  async (req: Auth0Request, res: Response, next: NextFunction) => {
    const { courseId } = req.query;

    if (req.user.type !== USER_TYPE_TEACHER) {
      return next(
        new AppError({
          statusCode: StatusCode.FORBIDDEN,
          description: 'Only teachers can see the list of students of a course',
        }),
      );
    }

    const course = await db.course.findByPk(courseId, {
      plain: true,
      include: [
        {
          model: db.user,
          as: 'students',
          attributes: ['id', 'email', 'name'],
          through: { attributes: [] },
        },
      ],
    });

    res.status(200);
    res.send(course);
  },
);
