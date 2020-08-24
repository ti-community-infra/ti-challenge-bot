'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class ChallengePrograms extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  ChallengePrograms.init({
    program_theme: DataTypes.STRING,
    program_name: DataTypes.TEXT,
    program_desc: DataTypes.TEXT,
    begin_at: DataTypes.DATE,
    end_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'ChallengePrograms',
    underscored: true,
    tableName: 'challenge_programs'
  })
  return ChallengePrograms
}
