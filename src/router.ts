'use strict';

const router = require('express').Router();

const authMiddleware = require('./middlewares/auth');

const serverStatus = require('./controllers/status');
const user = require('./controllers/user');
const course = require('./controllers/course');
const abpEvaluation = require('./controllers/abpEvaluation');
const courseScore = require('./controllers/courseScore');
const admin = require('./controllers/createData');

// Open routes
router.get('/api/dummy', user.dummy);
router.post('/api/login', user.login);
router.post('/api/confirm-user', user.confirmUser);
router.get('/api/get-user-to-confirm', user.getUserToConfirm);

// Authenticated routes
router.post('/api/logout', authMiddleware, user.logout);
router.get('/api/courses', authMiddleware, course.getCourses);
router.get('/api/course-info', authMiddleware, course.getCourseInfo);
router.get('/api/students', authMiddleware, user.getStudents);
router.get('/api/evaluations', authMiddleware, abpEvaluation.getEvaluations);
router.get(
  '/api/all-evaluations-abp',
  authMiddleware,
  abpEvaluation.getAllEvaluationsForAbp,
);
router.get(
  '/api/all-evaluations-student',
  authMiddleware,
  abpEvaluation.getAllEvaluationsForStudent,
);
router.post('/api/evaluation', authMiddleware, abpEvaluation.postEvaluation);
router.post(
  '/api/evaluation-chats',
  authMiddleware,
  abpEvaluation.postEvaluationChats,
);
router.post(
  '/api/evaluations-all',
  authMiddleware,
  abpEvaluation.postAllEvaluations,
);
router.post('/api/course-score', authMiddleware, courseScore.postCourseScore);

// Admin routes (protected by admin password)
router.post('/api/user', user.createUser);
router.post('/api/course', course.createCourse);
router.post('/api/course-set-teachers', course.setCourseTeachers);
router.post('/api/course-enroll-students', course.enrollStudents);
router.post('/api/create-data', admin.createAppData);

module.exports = router;
