'use strict';

module.exports = (sequelize, DataTypes) => {
  const CourseScore = sequelize.define('courseScore', {
    finalScore: {
      type: DataTypes.FLOAT,
    },
  });
  CourseScore.associate = (models) => {
    CourseScore.belongsTo(models.course);
    CourseScore.belongsTo(models.user, { as: 'student' });
  };
  return CourseScore;
};
