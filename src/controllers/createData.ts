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
  s1: { name: 'Juan José Albarracin Aucapiña', email: 's1@test.com' },
  s2: { name: 'Antoni Garçon Peyri', email: 's2@test.com' },
  s3: { name: 'Oriol Valls Conesa', email: 's3@test.com' },
  s4: { name: 'Agustí Costa Fontalba', email: 's4@test.com' },
  s5: { name: 'Núria Navarro Figueras', email: 's5@test.com' },
  s6: { name: 'Ramon Elias Garcia', email: 's6@test.com' },
  s7: { name: 'Sergi de Scheemaeker Cruset', email: 's7@test.com' },
  s8: { name: 'Miquel Grau Nieto', email: 's8@test.com' },
  s9: { name: 'Pau Zamora i Cullell', email: 's9@test.com' },
  s10: { name: 'ELOI PLA ASESIO', email: 's10@test.com' },
  s11: { name: 'Josep Solà Pladevall', email: 's11@test.com' },
  s12: { name: 'Gil Bosch Molist', email: 's12@test.com' },
  s13: { name: 'Marcel Brosa Espuña', email: 's13@test.com' },
  s14: { name: 'Cinthia Estefania Padilla Gallegos', email: 's14@test.com' },
  s15: { name: 'Nayibe Lisbeth Cárdenas Legarda', email: 's15@test.com' },
  s16: { name: 'Valeria Zambrano Quiñones', email: 's16@test.com' },
  s17: { name: 'LUZ KARIME SÁNCHEZ GALVIS', email: 's17@test.com' },
  s18: { name: 'Maria Camila Uribe Solano', email: 's18@test.com' },
  s19: { name: 'Kevin Ramos Corredor', email: 's19@test.com' },
  s20: { name: 'Ana Elena Solórzano Ruiz', email: 's20@test.com' },
  s21: { name: 'Liz Karen Montecinos Rivero', email: 's21@test.com' },
  s22: { name: 'Judith Delgado Centurión', email: 's22@test.com' },
  s23: { name: 'Paulo César Caballero López', email: 's23@test.com' },
};

// const teachers = {
//   dumbledore: { name: 'Dumbledore', email: 'dumbledore@test.com' },
//   snape: { name: 'Snape', email: 'tnape@test.com' },
//   ignasi: { name: 'Ignasi', email: 'ignasi@test.com' },
//   minerva: { name: 'Minerva', email: 'minerva@test.com' },
// };

const teachers = {
  t1: { name: 'Anna Ribas', email: 't1@test.com' },
  t2: { name: 'Pep Mas', email: 't2@test.com' },
  t3: { name: 'Marilos Balaguer', email: 't3@test.com' },
  t4: { name: 'Àngels Xabadia', email: 't4@test.com' },
  t5: { name: 'Teresa Serra', email: 't5@test.com' },
  t6: { name: 'Victòria Salvadó', email: 't6@test.com' },
  t7: { name: 'Sergi Sabater', email: 't7@test.com' },
  t8: { name: 'Xavier Quintana', email: 't8@test.com' },
  t9: { name: 'Jaume Puig', email: 't9@test.com' },
  t10: { name: 'Joaquim Melendez', email: 't10@test.com' },
  t11: { name: 'Joaquim Comas', email: 't11@test.com' },
  t12: { name: 'Eva Margui', email: 't12@test.com' },
  t13: { name: 'Anna Romaní', email: 't13@test.com' },
  t14: { name: 'Ignasi Rodriguez-Roda', email: 't14@test.com' },
  t15: { name: 'Frederic Gich', email: 't15@test.com' },
  t16: { name: 'Dani Boix', email: 't16@test.com' },
  t17: { name: 'Lluís Zamora', email: 't17@test.com' },
  t18: { name: 'Xavier Casamitjana', email: 't18@test.com' },
  t19: { name: 'Gerard Arbat', email: 't19@test.com' },
  t20: { name: 'Xavier García-Acosta', email: 't20@test.com' },
  t21: { name: 'Albert Llausàs', email: 't21@test.com' },
  t22: { name: 'Miquel Duran', email: 't22@test.com' },
  t23: { name: 'Joan Pujol', email: 't23@test.com' },
  t24: { name: 'Maria Martin', email: 't24@test.com' },
  t25: { name: 'Josep Pueyo', email: 't25@test.com' },
  t26: { name: 'Anna Menció', email: 't26@test.com' },
  t27: { name: 'Sebastià Puig', email: 't27@test.com' },
  t28: { name: 'Pilar Marqués', email: 't28@test.com' },
  t29: { name: 'Estefania Gascon', email: 't29@test.com' },
  t30: { name: 'Hèctor Monclús', email: 't30@test.com' },
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
