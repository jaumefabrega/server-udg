'use strict';
import { NextFunction, Response } from 'express';
import { Auth0Request, User } from '../interfaces';
import { AppError } from '../middlewares/errorHandling/appError';
import { StatusCode } from '../utils/httpCodes';
import { catchAsync } from '../utils/catchAsync';
const db = require('../models');

const { ADMIN_PASSWORD } = process.env;

type UserToCreate = {
  name: string;
  email: string;
  type?: string; // TODO: 'student' | 'teacher'
  id?: number;
  dbUser?: any;
};

const students = {
  harry: { name: 'Harry', email: 'harry@test.com' },
  ron: { name: 'Ron', email: 'ron@test.com' },
  hermione: { name: 'Hermione', email: 'hermione@test.com' },
  draco: { name: 'Draco', email: 'draco@test.com' },
  luna: { name: 'Luna', email: 'luna@test.com' },
  neville: { name: 'Neville', email: 'neville@test.com' },
};

const teachers = {
  dumbledore: { name: 'Dumbledore', email: 'dumbledore@test.com' },
  snape: { name: 'Snape', email: 'snape@test.com' },
  ignasi: { name: 'Ignasi', email: 'ignasi@test.com' },
  minerva: { name: 'Minerva', email: 'minerva@test.com' },
};

const users: UserToCreate[] = [
  ...Object.values(students).map((student) => ({
    ...student,
    type: 'student',
  })),
  ...Object.values(teachers).map((teacher) => ({
    ...teacher,
    type: 'teacher',
  })),
];

const courses = [
  {
    name: 'Biología',
    weeksDuration: 2,
    teachers: [teachers.dumbledore, teachers.ignasi], // FIX: TODO: Should check it's not bigger than weeksDuration
    students: [students.harry, students.ron, students.hermione],
  },
  {
    name: 'Electrónica',
    weeksDuration: 2,
    teachers: [teachers.ignasi, teachers.dumbledore],
    students: [
      students.hermione,
      students.harry,
      students.ron,
      students.draco,
      students.luna,
      students.neville,
    ],
  },
  {
    name: 'Química',
    weeksDuration: 4,
    teachers: [
      teachers.ignasi,
      teachers.ignasi,
      teachers.minerva,
      teachers.dumbledore,
    ],
    students: [
      students.hermione,
      students.harry,
      students.ron,
      students.draco,
      students.luna,
    ],
  },
];

async function createData() {
  // Create students & teachers
  for (let i = 0; i < users.length; i++) {
    const userToCreate = users[i];
    const dbUser = await db.user.create(userToCreate);
    userToCreate.id = dbUser.id;
    userToCreate.dbUser = dbUser;
  }

  // Create courses
  for (let i = 0; i < courses.length; i++) {
    const courseToCreate = courses[i];

    const studentNames = courseToCreate.students?.map((s) => s.name) || []; // FIX: TODO: [] shouldn't be necessary after TS
    const dbStudents = users
      .filter((user) => studentNames?.includes(user.name))
      .map((user) => user.dbUser);

    // Create course
    const dbCourse = await db.course.create({
      ...courseToCreate,
    });

    // Enroll students
    await dbCourse.addStudents(dbStudents);

    const teacherNames = courseToCreate.teachers?.map((t) => t.name) || []; // FIX: TODO: [] shouldn't be necessary after TS
    const dbTeachers = users
      .filter((user) => teacherNames?.includes(user.name))
      .map((user) => user.dbUser);

    // Create ABPs
    for (let j = 0; j < courseToCreate.weeksDuration; j++) {
      const dbAbp = await db.abp.create({
        order: j,
        courseId: dbCourse.id,
      });

      // Assign teacher
      const dbTeacher = dbTeachers[j];
      if (dbTeacher) {
        dbAbp.teacherId = dbTeacher.id;
        await dbAbp.save();
      }

      // Create ABP Evaluations
      for (let k = 0; k < dbStudents.length; k++) {
        await db.abpEvaluation.create({
          studentId: dbStudents[k].id,
          abpId: dbAbp.id,
        });
      }
    }

    // Create CourseScores
    // FIX: TODO: not tested yet
    for (let j = 0; j < dbStudents.length; j++) {
      await db.courseScore.create({
        studentId: dbStudents[j].id,
        courseId: dbCourse.id,
      });
    }
  }
}

exports.createAppData = catchAsync(
  async (req: Auth0Request, res: Response, next: NextFunction) => {
    const { adminPassword } = req.body;
    if (adminPassword !== ADMIN_PASSWORD) {
      return next(
        new AppError({
          statusCode: StatusCode.FORBIDDEN,
          description: 'You must be an admin',
        }),
      );
    }

    createData();

    res.status(201).send();
  },
);
