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

            {
              model: db.user,
              as: 'teacher',
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
        abpEvaluations.push({
          ...evaluation,
          teacherId: abp.teacherId,
          teacherName: abp.teacher?.name,
        }),
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

exports.getAllEvaluationsForAbp = catchAsync(
  async (req: Auth0Request, res: Response, next: NextFunction) => {
    const { courseId, abpId } = req.query;

    const course = await db.course.findByPk(courseId);

    const abp = await db.abp.findByPk(abpId, {
      include: [
        {
          model: db.abpEvaluation,
          include: [
            {
              model: db.user,
              as: 'student',
              attributes: ['id', 'email', 'name'],
            },
          ],
        },
        {
          model: db.user,
          as: 'teachers',
          through: { attributes: [] },
          attributes: ['id', 'email', 'name'],
        },
      ],
    });

    res.status(200);
    res.send({ course, abp });
  },
);

exports.getAllEvaluationsForStudent = catchAsync(
  async (req: Auth0Request, res: Response, next: NextFunction) => {
    const studentId = req.user?.id || 1; // FIX: remove the or, for testing only

    const abpEvaluations = await db.abpEvaluation.findAll({
      where: { studentId },
      include: [
        {
          model: db.abp,
          include: [
            {
              model: db.course,
            },
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

    const student = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    };
    res.status(200);
    res.send({ abpEvaluations, student });
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

    res.status(201);
    res.send(updatedAbpEvaluation);
  },
);

exports.postAllEvaluations = catchAsync(
  async (req: Auth0Request, res: Response, next: NextFunction) => {
    const evaluationsToPost = req.body;

    const user = req.user;

    let abpEvaluation;
    let updatedAbpEvaluation;
    if (user.type === USER_TYPE_STUDENT) {
      return next(
        new AppError({
          statusCode: StatusCode.FORBIDDEN,
          description: 'You are not a teacher of this course',
        }),
      );
    } else if (user.type === USER_TYPE_TEACHER) {
      for (let i = 0; i < evaluationsToPost.length; i++) {
        const evToPost = evaluationsToPost[i];
        abpEvaluation = await db.abpEvaluation.findOne({
          where: { id: evToPost.id },
        });

        if (abpEvaluation) {
          abpEvaluation.asistencia = evToPost.asistencia;
          abpEvaluation.interes = evToPost.interes;
          abpEvaluation.informacion = evToPost.informacion;
          abpEvaluation.interaccion = evToPost.interaccion;
          abpEvaluation.estudio = evToPost.estudio;
          abpEvaluation.fuentes = evToPost.fuentes;
          abpEvaluation.analisis = evToPost.analisis;
          abpEvaluation.notaFinal = evToPost.notaFinal;
          updatedAbpEvaluation = await abpEvaluation.save();
        }
      }
    }

    res.status(201);
    res.send(evaluationsToPost);
  },
);

exports.postEvaluationChats = catchAsync(
  async (req: Auth0Request, res: Response, next: NextFunction) => {
    const { id, chatTeacher1, chatStudent1, chatTeacher2 } = req.body;

    const user = req.user;

    let abpEvaluation;
    let updatedAbpEvaluation;
    if (user.type === USER_TYPE_STUDENT) {
      abpEvaluation = await db.abpEvaluation.findOne({
        where: { id, studentId: req.user.id },
      });
      abpEvaluation.chatStudent1 = chatStudent1;
      updatedAbpEvaluation = await abpEvaluation.save();
    } else if (user.type === USER_TYPE_TEACHER) {
      abpEvaluation = await db.abpEvaluation.findOne({
        where: { id },
      });
      abpEvaluation.chatTeacher1 = chatTeacher1;
      abpEvaluation.chatTeacher2 = chatTeacher2;
      updatedAbpEvaluation = await abpEvaluation.save();
    }

    res.status(201);
    res.send(updatedAbpEvaluation);
  },
);
