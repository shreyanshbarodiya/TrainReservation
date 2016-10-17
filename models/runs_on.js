/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Runs_on', {
    train_no: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Train',
        key: 'train_no'
      }
    },
    day_of_week: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    }
  }, {
    timestamps: false,
    tableName: 'runs_on'
  });
};
