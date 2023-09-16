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
    Abp.belongsToMany(models.user, { through: 'abpTeachers', as: 'teachers' });
    Abp.hasMany(models.abpEvaluation);
  };
  return Abp;
};
