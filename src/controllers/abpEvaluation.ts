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

exports.getEvaluations = catchAsync(
  async (req: Auth0Request, res: Response, next: NextFunction) => {
    const { courseId } = req.query;
    const studentId =
      req.user.type === USER_TYPE_STUDENT ? req.user.id : req.query.studentId;

    const course = await db.course.findByPk(courseId, {
      include: [
        {
          model: db.abp,
          include: [
            {
              model: db.abpEvaluation,
              where: { studentId: studentId },
            },
          ],
        },
        {
          model: db.courseScore,
        },
        {
          model: db.user,
          as: 'students',
          where: { id: studentId },
          attributes: ['name', 'email', 'id'],
          through: { attributes: [] },
        },
      ],
    });

    res.status(200);
    const jsonCourse = course.toJSON();
    const abpEvaluations: any = [];
    jsonCourse.abps.forEach((abp: any) =>
      abp.abpEvaluations.forEach((evaluation: any) =>
        abpEvaluations.push({ ...evaluation, teacherId: abp.teacherId }),
      ),
    );

    delete jsonCourse.abps;
    jsonCourse.abpEvaluations = abpEvaluations;
    jsonCourse.courseScore =
      jsonCourse.courseScores?.length !== 0
        ? jsonCourse.courseScores[0]
        : undefined;
    delete jsonCourse.courseScores;
    jsonCourse.student =
      jsonCourse.students?.length > 0 ? jsonCourse.students[0] : undefined;
    delete jsonCourse.students;
    res.send({ ...jsonCourse, abps: undefined });
  },
);

// FIX: TODO: REALTODO: needs to be tested, developed without running the project
exports.postEvaluation = catchAsync(
  async (req: Auth0Request, res: Response, next: NextFunction) => {
    const { id, ...evaluationFields } = req.body;

    const user = req.user;

    let abpEvaluation;
    let updatedAbpEvaluation;
    if (user.type === USER_TYPE_STUDENT) {
      abpEvaluation = await db.abpEvaluation.findOne({
        where: { id, studentId: req.user.id },
      });
      abpEvaluation.studentResponse = evaluationFields.studentResponse;
      updatedAbpEvaluation = await abpEvaluation.save();
    } else if (user.type === USER_TYPE_TEACHER) {
      abpEvaluation = await db.abpEvaluation.findOne({
        where: { id },
      });
      abpEvaluation.textEval1 = evaluationFields.textEval1;
      abpEvaluation.textEval2 = evaluationFields.textEval2;
      abpEvaluation.textEval3 = evaluationFields.textEval3;
      updatedAbpEvaluation = await abpEvaluation.save();
    }

    res.status(204);
    res.send(updatedAbpEvaluation);
  },
);
