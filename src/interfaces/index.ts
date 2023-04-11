import * as Sequelize from 'sequelize';
import { Request } from 'express';
import { USER_TYPE_TEACHER, USER_TYPE_STUDENT } from '../constants';
export interface Auth0Request extends Request {
  user: User;
}

export interface User extends Sequelize.Model {
  id: number;
  email: string;
  password: string;
  name: string;
  type: typeof USER_TYPE_TEACHER | typeof USER_TYPE_STUDENT;
  hasConfirmed: boolean;
  studentId?: number;
  teacherId?: number;
}
