'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('challenge_programs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      program_theme: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      program_name: {
        type: Sequelize.TEXT,
        defaultValue: null,
        allowNull: true
      },
      program_desc: {
        type: Sequelize.TEXT,
        defaultValue: null,
        allowNull: true
      },
      begin_at: {
        type: Sequelize.DATE,
        defaultValue: null,
        allowNull: true
      },
      end_at: {
        type: Sequelize.DATE,
        defaultValue: null,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('challenge_programs')
  }
}
