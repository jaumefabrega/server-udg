'use strict';

module.exports = (sequelize, DataTypes) => {
  const ApbEvaluation = sequelize.define('abpEvaluation', {
    textEval1: {
      type: DataTypes.STRING,
    },
    textEval2: {
      type: DataTypes.STRING,
    },
    textEval3: {
      type: DataTypes.STRING,
    },
    studentResponse: {
      type: DataTypes.STRING,
    },
  });
  ApbEvaluation.associate = (models) => {
    ApbEvaluation.belongsTo(models.abp);
    ApbEvaluation.belongsTo(models.user, { as: 'student' });
  };
  return ApbEvaluation;
};
