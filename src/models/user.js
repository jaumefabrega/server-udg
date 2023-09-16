'use strict';
import { USER_TYPE_TEACHER, USER_TYPE_STUDENT } from '../constants';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    registrationUUID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hasConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // FIX: user's "type" is maybe not needed, but might facilitate queries. Consider.
    type: {
      type: DataTypes.ENUM(USER_TYPE_TEACHER, USER_TYPE_STUDENT),
      allowNull: false,
    },
  });
  User.associate = (models) => {
    User.hasMany(models.abpEvaluation);
    User.hasMany(models.courseScore);
    User.belongsToMany(models.course, {
      through: 'studentCourses',
    });
    User.belongsToMany(models.abp, {
      through: 'abpTeachers',
    });
  };
  return User;
};
