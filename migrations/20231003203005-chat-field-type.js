'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return Promise.all([
      queryInterface.changeColumn('abpEvaluations', 'chatTeacher1', {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
      }),
      queryInterface.changeColumn('abpEvaluations', 'chatStudent1', {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
      }),
      queryInterface.changeColumn('abpEvaluations', 'chatTeacher2', {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    return Promise.all([
      queryInterface.changeColumn('abpEvaluations', 'chatTeacher1', {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      }),
      queryInterface.changeColumn('abpEvaluations', 'chatStudent1', {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      }),
      queryInterface.changeColumn('abpEvaluations', 'chatTeacher2', {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      }),
    ]);
  },
};
