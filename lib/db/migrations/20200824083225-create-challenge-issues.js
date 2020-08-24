'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('challenge_issues', {
      issue_id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        allowNull: false,
        references: {
          model: {
            tableName: 'issues'
          },
          key: 'id',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }
      },
      sig_id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        references: {
          model: {
            tableName: 'sig'
          },
          key: 'id',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }
      },
      score: {
        type: Sequelize.INTEGER(11),
        allowNull: false
      },
      mentor: {
        type: Sequelize.STRING,
        allowNull: false
      },
      has_picked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      current_challenger_github_id: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true
      },
      picked_at: {
        type: Sequelize.DATE,
        defaultValue: null,
        allowNull: true
      },
      challenge_program_id: {
        type: Sequelize.INTEGER(11),
        defaultValue: null,
        allowNull: true,
        references: {
          model: {
            tableName: 'challenge_programs'
          },
          key: 'id',
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
    await queryInterface.dropTable('challenge_issues')
  }
}
