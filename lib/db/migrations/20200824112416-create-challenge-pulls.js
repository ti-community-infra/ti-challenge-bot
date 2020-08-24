'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('challenge_pulls', {
      pull_id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        allowNull: false,
        references: {
          model: {
            tableName: 'pulls'
          },
          key: 'id',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }
      },
      reward: {
        type: Sequelize.INTEGER(11),
        defaultValue: 0,
        allowNull: false
      },
      challenge_issue_id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        references: {
          model: {
            tableName: 'challenge_issues'
          },
          key: 'issue_id',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }
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
    await queryInterface.dropTable('challenge_pulls')
  }
}
