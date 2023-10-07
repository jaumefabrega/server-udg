'use strict';

module.exports = (sequelize, DataTypes) => {
  const ApbEvaluation = sequelize.define('abpEvaluation', {
    asistencia: {
      type: DataTypes.FLOAT,
    },
    interes: {
      type: DataTypes.FLOAT,
    },
    informacion: {
      type: DataTypes.FLOAT,
    },
    interaccion: {
      type: DataTypes.FLOAT,
    },
    estudio: {
      type: DataTypes.FLOAT,
    },
    fuentes: {
      type: DataTypes.FLOAT,
    },
    analisis: {
      type: DataTypes.FLOAT,
    },
    notaFinal: {
      type: DataTypes.FLOAT,
    },
    chatTeacher1: {
      type: DataTypes.TEXT,
    },
    chatStudent1: {
      type: DataTypes.TEXT,
    },
    chatTeacher2: {
      type: DataTypes.TEXT,
    },
  });
  ApbEvaluation.associate = (models) => {
    ApbEvaluation.belongsTo(models.abp);
    ApbEvaluation.belongsTo(models.user, { as: 'student' });
  };
  return ApbEvaluation;
};
