'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class ChallengePulls extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  ChallengePulls.init({
    pull_id: DataTypes.INTEGER(11),
    reward: DataTypes.INTEGER(11),
    issue_id: DataTypes.INTEGER(11)
  }, {
    sequelize,
    modelName: 'ChallengePulls',
    underscored: true,
    tableName: 'challenge_pulls'
  })
  return ChallengePulls
}
