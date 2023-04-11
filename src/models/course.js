'use strict';

module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('course', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    weeksDuration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
  Course.associate = (models) => {
    Course.belongsToMany(models.user, {
      through: 'studentCourses',
      as: 'students',
    });
    Course.hasMany(models.abp);
    Course.hasMany(models.courseScore);
  };
  return Course;
};
