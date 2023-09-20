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
  s1: { name: 'Marta Mulet Mauleon', email: 'marta.mulet37@gmail.com' },
  s2: { name: 'Arnau Trias i Oliveras', email: 'triasoliveras19@hotmail.com' },
  s3: {
    name: 'Xavier Francés Alduan',
    email: 'xavierfrancesalduan3@gmail.com',
  },
  s4: { name: 'Èric Herrán i Morueco', email: 'erichm18@gmail.com' },
  s5: { name: 'Inès Sunyer Guiscafré', email: 'imsg.2125.op@gmail.com' },
  s6: {
    name: 'Eliana María Cabra Cortés',
    email: 'emcabrac@correo.udistrital.edu.co',
  },
  s7: { name: 'Juan Pablo Rojas Trigo', email: 'jprojas99@gmail.com' },
  s8: { name: 'Mar Auró Sánchez', email: 'maraurosanchez@gmail.com' },
  s9: {
    name: 'Cristian Giovanny Medina Amendaño',
    email: 'medinacris1295@gmail.com',
  },
  s10: { name: 'Eleonora Ruiz Ruiz', email: 'eleonoraruiz4@gmail.com' },
  s11: { name: 'Mohamed Assabri', email: 'Assabrimohamed67@gmail.com' },
  s12: { name: 'Itzel  Alcaraz Bernades', email: 'italbe98@gmail.com' },
  s13: { name: 'Arturo Ramón Sánchez', email: 'u1948217@campus.udg.edu' },
  s14: { name: 'Gisela  Gonzalvo Henry', email: 'u1961966@campus.udg.edu' },
};

const teachers = {
  t1: { name: 'Albert Llausàs', email: 'albert.llausas@udg.edu' },
  t2: { name: 'Josep Pueyo', email: 'josep.pueyo@udg.edu' },
  t3: { name: 'Eva Margui', email: 'eva.margui@udg.edu' },
  t4: { name: 'Lluís Banyeras', email: 'lluis.banyeras@udg.edu' },
  t5: { name: 'Joan Pujol', email: 'joan.pujol@udg.edu' },
  t6: { name: 'Miquel Duran Ros', email: 'miquel.duranros@udg.edu' },
  t7: { name: 'Anna Ribas', email: 'anna.ribas@udg.edu' },
  t8: { name: 'Xavier Vila', email: 'xavier.vila@udg.edu' },
  t9: { name: 'Maria Martín', email: 'maria.martin@udg.edu' },
  t10: { name: 'Hèctor Monclús', email: 'hector.monclus@udg.edu' },
  t11: { name: 'Sebastià Puig', email: 'sebastia.puig@udg.edu' },
  t12: { name: 'Ignasi Rodríguez-Roda', email: 'ignasi.rodriguezroda@udg.edu' },
  t13: { name: 'Marilós Balaguer', email: 'dolors.balaguer@udg.edu' },
  t14: { name: 'Josep Mas', email: 'josep.mas@udg.edu' },
  t15: { name: 'Anna Menció', email: 'anna.mencio@udg.edu' },
  t16: { name: 'Anna Romaní', email: 'anna.romani@udg.edu' },
  t17: { name: 'Ada Pastor', email: 'ada.pastor@udg.edu' },
  t18: { name: 'Sortida de camp Baix Ter', email: '' },
  t19: { name: 'Pilar Marquès', email: 'pilar.marques@udg.edu' },
  t20: { name: 'Àngels Xabadia', email: 'angels.xabadia@udg.edu' },
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
    name: 'Usos del agua - Grupo A',
    weeksDuration: 4,
    order: 0,
    teachers: [[teachers.t1], [teachers.t3], [teachers.t5], [teachers.t7]],
    students: [
      students.s1,
      students.s2,
      students.s3,
      students.s4,
      students.s5,
      students.s6,
      students.s7,
    ],
  },
  {
    name: 'Usos del agua - Grupo B',
    weeksDuration: 4,
    order: 1,
    teachers: [[teachers.t2], [teachers.t4], [teachers.t6], [teachers.t2]],
    students: [
      students.s8,
      students.s9,
      students.s10,
      students.s11,
      students.s12,
      students.s13,
      students.s14,
    ],
  },
  {
    name: 'Sistemas de Tratamiento del Agua - Grupo A',
    weeksDuration: 4,
    order: 2,
    teachers: [[teachers.t3], [teachers.t9], [teachers.t11], [teachers.t9]],
    students: [
      students.s1,
      students.s2,
      students.s3,
      students.s4,
      students.s5,
      students.s6,
      students.s7,
    ],
  },
  {
    name: 'Sistemas de Tratamiento del Agua - Grupo B',
    weeksDuration: 4,
    order: 3,
    teachers: [[teachers.t8], [teachers.t10], [teachers.t12], [teachers.t13]],
    students: [
      students.s8,
      students.s9,
      students.s10,
      students.s11,
      students.s12,
      students.s13,
      students.s14,
    ],
  },
  {
    name: 'Medio Hídrico - Grupo A',
    weeksDuration: 4,
    order: 4,
    teachers: [[teachers.t14], [teachers.t14], [teachers.t15], [teachers.t16]],
    students: [
      students.s1,
      students.s2,
      students.s3,
      students.s4,
      students.s5,
      students.s6,
      students.s7,
    ],
  },
  {
    name: 'Medio Hídrico - Grupo B',
    weeksDuration: 4,
    order: 5,
    teachers: [[teachers.t15], [teachers.t14], [teachers.t15], [teachers.t17]],
    students: [
      students.s8,
      students.s9,
      students.s10,
      students.s11,
      students.s12,
      students.s13,
      students.s14,
    ],
  },
  {
    name: 'Gestión Empresarial en el Sector del Agua - Grupo A',
    weeksDuration: 1,
    order: 6,
    teachers: [[teachers.t19]],
    students: [
      students.s1,
      students.s2,
      students.s3,
      students.s4,
      students.s5,
      students.s6,
      students.s7,
    ],
  },
  {
    name: 'Gestión Empresarial en el Sector del Agua - Grupo B',
    weeksDuration: 1,
    order: 7,
    teachers: [[teachers.t20]],
    students: [
      students.s8,
      students.s9,
      students.s10,
      students.s11,
      students.s12,
      students.s13,
      students.s14,
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

    // const teacherNames =
    //   courseToCreate.teachers?.map((abpTeachers) =>
    //     abpTeachers.map((t) => t.name),
    //   ) || []; // FIX: TODO: [] shouldn't be necessary after TS

    const dbTeachersIds = []; // array where every element is an array of the abp db teachers
    for (let j = 0; j < courseToCreate.teachers.length; j++) {
      const abpTeachers = courseToCreate.teachers[j];
      const dbAbpTeachers = [];
      for (let k = 0; k < abpTeachers.length; k++) {
        const dbTeacher = users.find(
          (user) => user.name === abpTeachers[k].name,
        );
        dbAbpTeachers.push(dbTeacher);
      }
      dbTeachersIds.push(dbAbpTeachers.map((t) => t?.id));
    }

    // const dbTeachers = users
    //   .filter((user) => teacherNames?.includes(user.name))
    //   .map((user) => user.dbUser);

    // const dbTeachers = teacherNames.map(
    //   teachers.map((tName) => {
    //     const theTeacher = users.find((user) => (user.name = tName));
    //     return theTeacher?.dbUser;
    //   }),
    // );
    // Create ABPs
    for (let j = 0; j < courseToCreate.weeksDuration; j++) {
      const dbAbp = await db.abp.create({
        order: j,
        courseId: dbCourse.id,
      });

      // Assign teachers
      const abpTeachers = dbTeachersIds[j];
      await dbAbp.addTeachers(abpTeachers);

      // Create ABP Evaluations
      for (let k = 0; k < dbStudents.length; k++) {
        await db.abpEvaluation.create({
          studentId: dbStudents[k].id,
          abpId: dbAbp.id,
        });
      }
    }

    // Create CourseScores
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
