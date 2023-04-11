'use strict';

module.exports = (sequelize, DataTypes) => {
  const CourseScore = sequelize.define('courseScore', {
    score1: {
      type: DataTypes.FLOAT,
    },
    score2: {
      type: DataTypes.FLOAT,
    },
    score3: {
      type: DataTypes.FLOAT,
    },
  });
  CourseScore.associate = (models) => {
    CourseScore.belongsTo(models.course);
    CourseScore.belongsTo(models.user, { as: 'student' });
  };
  return CourseScore;
};
