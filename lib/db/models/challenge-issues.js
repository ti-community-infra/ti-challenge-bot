'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class ChallengeIssues extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  ChallengeIssues.init({
    issue_id: DataTypes.INTEGER(11),
    sig_id: DataTypes.INTEGER(11),
    score: DataTypes.INTEGER(11),
    mentor: DataTypes.STRING,
    has_picked: DataTypes.BOOLEAN,
    current_challenger_github_id: DataTypes.STRING,
    picked_at: DataTypes.DATE,
    program_id: DataTypes.INTEGER(11)
  }, {
    sequelize,
    modelName: 'ChallengeIssues',
    underscored: true,
    tableName: 'challenge_issues'
  })
  return ChallengeIssues
}
