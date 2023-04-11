'use strict';

module.exports = (sequelize, DataTypes) => {
  const Abp = sequelize.define('abp', {
    order: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
  });

  Abp.associate = (models) => {
    Abp.belongsTo(models.course);
    Abp.belongsTo(models.user, { as: 'teacher' });
    Abp.hasMany(models.abpEvaluation);
  };
  return Abp;
};
