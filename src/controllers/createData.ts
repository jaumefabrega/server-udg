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

// const students = {
//   harry: { name: 'Harry', email: 'harry@test.com' },
//   ron: { name: 'Ron', email: 'ron@test.com' },
//   hermione: { name: 'Hermione', email: 'hermione@test.com' },
//   draco: { name: 'Draco', email: 'draco@test.com' },
//   luna: { name: 'Luna', email: 'luna@test.com' },
//   neville: { name: 'Neville', email: 'neville@test.com' },
// };

const students = {
  s1: { name: 'Juan José Albarracin Aucapiña', email: 'test@test.com' },
  s2: { name: 'Antoni Garçon Peyri', email: 'test@test.com' },
  s3: { name: 'Oriol Valls Conesa', email: 'test@test.com' },
  s4: { name: 'Agustí Costa Fontalba', email: 'test@test.com' },
  s5: { name: 'Núria Navarro Figueras', email: 'test@test.com' },
  s6: { name: 'Ramon Elias Garcia', email: 'test@test.com' },
  s7: { name: 'Sergi de Scheemaeker Cruset', email: 'test@test.com' },
  s8: { name: 'Miquel Grau Nieto', email: 'test@test.com' },
  s9: { name: 'Pau Zamora i Cullell', email: 'test@test.com' },
  s10: { name: 'ELOI PLA ASESIO', email: 'test@test.com' },
  s11: { name: 'Josep Solà Pladevall', email: 'test@test.com' },
  s12: { name: 'Gil Bosch Molist', email: 'test@test.com' },
  s13: { name: 'Marcel Brosa Espuña', email: 'test@test.com' },
  s14: { name: 'Cinthia Estefania Padilla Gallegos', email: 'test@test.com' },
  s15: { name: 'Nayibe Lisbeth Cárdenas Legarda', email: 'test@test.com' },
  s16: { name: 'Valeria Zambrano Quiñones', email: 'test@test.com' },
  s17: { name: 'LUZ KARIME SÁNCHEZ GALVIS', email: 'test@test.com' },
  s18: { name: 'Maria Camila Uribe Solano', email: 'test@test.com' },
  s19: { name: 'Kevin Ramos Corredor', email: 'test@test.com' },
  s20: { name: 'Ana Elena Solórzano Ruiz', email: 'test@test.com' },
  s21: { name: 'Liz Karen Montecinos Rivero', email: 'test@test.com' },
  s22: { name: 'Judith Delgado Centurión', email: 'test@test.com' },
  s23: { name: 'Paulo César Caballero López', email: 'test@test.com' },
};

// const teachers = {
//   dumbledore: { name: 'Dumbledore', email: 'dumbledore@test.com' },
//   snape: { name: 'Snape', email: 'snape@test.com' },
//   ignasi: { name: 'Ignasi', email: 'ignasi@test.com' },
//   minerva: { name: 'Minerva', email: 'minerva@test.com' },
// };

const teachers = {
  t1: { name: 'Anna Ribas', email: 'test@test.com' },
  t2: { name: 'Pep Mas', email: 'test@test.com' },
  t3: { name: 'Marilos Balaguer', email: 'test@test.com' },
  t4: { name: 'Àngels Xabadia', email: 'test@test.com' },
  t5: { name: 'Teresa Serra', email: 'test@test.com' },
  t6: { name: 'Victòria Salvadó', email: 'test@test.com' },
  t7: { name: 'Sergi Sabater', email: 'test@test.com' },
  t8: { name: 'Xavier Quintana', email: 'test@test.com' },
  t9: { name: 'Jaume Puig', email: 'test@test.com' },
  t10: { name: 'Joaquim Melendez', email: 'test@test.com' },
  t11: { name: 'Joaquim Comas', email: 'test@test.com' },
  t12: { name: 'Eva Margui', email: 'test@test.com' },
  t13: { name: 'Anna Romaní', email: 'test@test.com' },
  t14: { name: 'Ignasi Rodriguez-Roda', email: 'test@test.com' },
  t15: { name: 'Frederic Gich', email: 'test@test.com' },
  t16: { name: 'Dani Boix', email: 'test@test.com' },
  t17: { name: 'Lluís Zamora', email: 'test@test.com' },
  t18: { name: 'Xavier Casamitjana', email: 'test@test.com' },
  t19: { name: 'Gerard Arbat', email: 'test@test.com' },
  t20: { name: 'Xavier García-Acosta', email: 'test@test.com' },
  t21: { name: 'Albert Llausàs', email: 'test@test.com' },
  t22: { name: 'Miquel Duran', email: 'test@test.com' },
  t23: { name: 'Joan Pujol', email: 'test@test.com' },
  t24: { name: 'Maria Martin', email: 'test@test.com' },
  t25: { name: 'Josep Pueyo', email: 'test@test.com' },
  t26: { name: 'Anna Menció', email: 'test@test.com' },
  t27: { name: 'Sebastià Puig', email: 'test@test.com' },
  t28: { name: 'Pilar Marqués', email: 'test@test.com' },
  t29: { name: 'Estefania Gascon', email: 'test@test.com' },
  t30: { name: 'Hèctor Monclús', email: 'test@test.com' },
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

// const courses = [
//   {
//     name: 'Biología',
//     weeksDuration: 2,
//     teachers: [teachers.dumbledore, teachers.ignasi], // FIX: TODO: Should check it's not bigger than weeksDuration
//     students: [students.harry, students.ron, students.hermione],
//   },
//   {
//     name: 'Electrónica',
//     weeksDuration: 2,
//     teachers: [teachers.ignasi, teachers.dumbledore],
//     students: [
//       students.hermione,
//       students.harry,
//       students.ron,
//       students.draco,
//       students.luna,
//       students.neville,
//     ],
//   },
//   {
//     name: 'Química',
//     weeksDuration: 4,
//     teachers: [
//       teachers.ignasi,
//       teachers.ignasi,
//       teachers.minerva,
//       teachers.dumbledore,
//     ],
//     students: [
//       students.hermione,
//       students.harry,
//       students.ron,
//       students.draco,
//       students.luna,
//     ],
//   },
// ];

const courses = [
  {
    name: 'Usos del agua - Grupo A',
    weeksDuration: 4,
    teachers: [teachers.t1, teachers.t12, teachers.t21, teachers.t23],
    students: [
      students.s3,
      students.s5,
      students.s8,
      students.s9,
      students.s10,
      students.s11,
      students.s13,
      students.s14,
      students.s16,
      students.s18,
      students.s20,
      students.s22,
    ],
  },
  {
    name: 'Medio Hídrico - Grupo A',
    weeksDuration: 4,
    teachers: [teachers.t2, teachers.t2, teachers.t13, teachers.t13],
    students: [
      students.s3,
      students.s5,
      students.s8,
      students.s9,
      students.s10,
      students.s11,
      students.s13,
      students.s14,
      students.s16,
      students.s18,
      students.s20,
      students.s22,
    ],
  },
  {
    name: 'Sistemas de tratamiento - Grupo A',
    weeksDuration: 4,
    teachers: [teachers.t3, teachers.t14, teachers.t12, teachers.t24],
    students: [
      students.s3,
      students.s5,
      students.s8,
      students.s9,
      students.s10,
      students.s11,
      students.s13,
      students.s14,
      students.s16,
      students.s18,
      students.s20,
      students.s22,
    ],
  },
  {
    name: 'Gestión empresarial - Grupo A',
    weeksDuration: 2,
    teachers: [teachers.t4, teachers.t4],
    students: [
      students.s3,
      students.s5,
      students.s8,
      students.s9,
      students.s10,
      students.s11,
      students.s13,
      students.s14,
      students.s16,
      students.s18,
      students.s20,
      students.s22,
    ],
  },
  {
    name: 'Usos del agua - Grupo B',
    weeksDuration: 4,
    teachers: [teachers.t25, teachers.t22, teachers.t15, teachers.t15],
    students: [
      students.s1,
      students.s2,
      students.s4,
      students.s6,
      students.s7,
      students.s12,
      students.s15,
      students.s17,
      students.s19,
      students.s21,
      students.s23,
    ],
  },
  {
    name: 'Medio Hídrico - Grupo B',
    weeksDuration: 4,
    teachers: [teachers.t26, teachers.t26, teachers.t29, teachers.t29],
    students: [
      students.s1,
      students.s2,
      students.s4,
      students.s6,
      students.s7,
      students.s12,
      students.s15,
      students.s17,
      students.s19,
      students.s21,
      students.s23,
    ],
  },
  {
    name: 'Sistemas de tratamiento - Grupo B',
    weeksDuration: 4,
    teachers: [teachers.t27, teachers.t30, teachers.t15, teachers.t15],
    students: [
      students.s1,
      students.s2,
      students.s4,
      students.s6,
      students.s7,
      students.s12,
      students.s15,
      students.s17,
      students.s19,
      students.s21,
      students.s23,
    ],
  },
  {
    name: 'Gestión empresarial - Grupo B',
    weeksDuration: 2,
    teachers: [teachers.t28, teachers.t28],
    students: [
      students.s1,
      students.s2,
      students.s4,
      students.s6,
      students.s7,
      students.s12,
      students.s15,
      students.s17,
      students.s19,
      students.s21,
      students.s23,
    ],
  },
  {
    name: 'Calidad del agua',
    weeksDuration: 2,
    teachers: [teachers.t6, teachers.t16],
    students: [
      students.s1,
      students.s2,
      students.s5,
      students.s7,
      students.s8,
      students.s12,
      students.s13,
      students.s18,
    ],
  },
  {
    name: 'Sistemas fluviales',
    weeksDuration: 2,
    teachers: [teachers.t7, teachers.t17],
    students: [
      students.s1,
      students.s2,
      students.s5,
      students.s7,
      students.s8,
      students.s12,
      students.s13,
      students.s18,
    ],
  },
  {
    name: 'Sistemas leníticos',
    weeksDuration: 2,
    teachers: [teachers.t8, teachers.t18],
    students: [
      students.s1,
      students.s2,
      students.s5,
      students.s7,
      students.s8,
      students.s12,
      students.s13,
      students.s18,
    ],
  },
  {
    name: 'Infraestructuras del agua',
    weeksDuration: 2,
    teachers: [teachers.t9, teachers.t19],
    students: [
      students.s3,
      students.s4,
      students.s6,
      students.s9,
      students.s10,
      students.s14,
      students.s15,
      students.s16,
      students.s17,
      students.s19,
      students.s20,
      students.s21,
      students.s22,
      students.s23,
    ],
  },
  {
    name: 'TICs',
    weeksDuration: 2,
    teachers: [teachers.t10, teachers.t20],
    students: [
      students.s3,
      students.s4,
      students.s6,
      students.s9,
      students.s10,
      students.s14,
      students.s15,
      students.s16,
      students.s17,
      students.s19,
      students.s20,
      students.s21,
      students.s22,
      students.s23,
    ],
  },
  {
    name: 'Soluciones integradas',
    weeksDuration: 2,
    teachers: [teachers.t11, teachers.t10],
    students: [
      students.s3,
      students.s4,
      students.s6,
      students.s9,
      students.s10,
      students.s14,
      students.s15,
      students.s16,
      students.s17,
      students.s19,
      students.s20,
      students.s21,
      students.s22,
      students.s23,
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
