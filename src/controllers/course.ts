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

exports.createCourse = catchAsync(
  async (req: Auth0Request, res: Response, next: NextFunction) => {
    const { name, weeksDuration, adminPassword } = req.body;

    // FIX: todo: validate incoming request data (assertCourseIsValid)
    if (adminPassword !== ADMIN_PASSWORD) {
      return next(
        new AppError({
          statusCode: StatusCode.FORBIDDEN,
          description: 'You must be an admin',
        }),
      );
    }
    const course = await db.course.create({
      name,
      weeksDuration,
    });

    for (let i = 0; i < weeksDuration; i++) {
      const abp = await db.abp.create({
        order: i,
        courseId: course.id,
      });
    }
    res.status(201);
    res.send(course);
  },
);

exports.setCourseTeachers = catchAsync(
  async (req: Auth0Request, res: Response, next: NextFunction) => {
    const { teacherIds, courseId, adminPassword } = req.body;

    // FIX: todo: validate incoming request data
    if (adminPassword !== ADMIN_PASSWORD) {
      return next(
        new AppError({
          statusCode: StatusCode.FORBIDDEN,
          description: 'You must be an admin',
        }),
      );
    }

    const abps = await db.abp.findAll({
      where: { courseId },
      order: [['order', 'ASC']],
    });

    for (let i = 0; i < teacherIds || i < abps.length; i++) {
      abps[i].teacherId = teacherIds[i]; // FIX: TODO: should first check that teacher exists?
      await abps[i].save();
    }
    res.sendStatus(201);
  },
);

exports.enrollStudents = catchAsync(
  async (req: Auth0Request, res: Response, next: NextFunction) => {
    const { studentIds, courseId, adminPassword } = req.body;

    // FIX: todo: validate incoming request data
    if (adminPassword !== ADMIN_PASSWORD) {
      return next(
        new AppError({
          statusCode: StatusCode.FORBIDDEN,
          description: 'You must be an admin',
        }),
      );
    }

    const course = await db.course.findByPk(courseId);
    if (!course) {
      return next(
        new AppError({
          statusCode: StatusCode.NOT_FOUND,
          description: 'Course does not exist',
        }),
      );
    }
    // FIX: TODO: check that student is not already enrolled?
    const courseAbps = await db.abp.findAll({
      where: { courseId: course.id },
    });
    for (let i = 0; i < studentIds.length; i++) {
      const student = await db.user.findOne({
        where: { [Op.and]: [{ id: studentIds[i] }, { hasConfirmed: false }] },
      });
      if (student) {
        await course.addStudents(student); // FIX: TODO: can i just addStudentS and pass it an array?
        for (let j = 0; j < courseAbps.length; j++) {
          const abpEvaluation = await db.abpEvaluation.create({
            studentId: student.id,
            abpId: courseAbps[j].id,
          });
        }
        await db.courseScore.create({
          courseId: course.id,
          studentId: student.id,
        });
      }
    }
    res.status(201);
    res.send(course);
  },
);

exports.getCourses = catchAsync(
  async (req: Auth0Request, res: Response, next: NextFunction) => {
    // const { name, weeksDuration, adminPassword } = req.body;

    // FIX: todo: validate incoming request data (assertCourseIsValid)

    if (req.user.type === USER_TYPE_STUDENT) {
      const student = await db.user.findByPk(req.user.id, {
        plain: true,
        include: [
          {
            model: db.course,
            through: { attributes: [] },
          },
        ],
      });

      res.status(201);
      return res.send(student.courses);
    } else if (req.user.type === USER_TYPE_TEACHER) {
      // Teachers can see all courses
      const courses = await db.course.findAll({
        // include: [
        //   {
        //     model: db.abp,
        //     through: { attributes: [] },
        //     include: [
        //       { model: db.teacher, attributes: ['id', 'email', 'name'] },
        //     ],
        //   },
        // ],
      });

      res.status(200);
      return res.send(courses);
    }

    return next(
      new AppError({
        statusCode: StatusCode.BAD_REQUEST,
        description: 'User type not valid',
      }),
    );
  },
);

exports.getCourseInfo = catchAsync(
  async (req: Auth0Request, res: Response, next: NextFunction) => {
    const { courseId } = req.query;

    const course = await db.course.findByPk(courseId, {
      plain: true,
      include: [
        {
          model: db.abp,
          include: [
            {
              model: db.user,
              as: 'teachers',
              through: { attributes: [] },
              attributes: ['id', 'email', 'name'],
            },
          ],
        },
      ],
    });

    res.status(200);
    return res.send(course);
  },
);
