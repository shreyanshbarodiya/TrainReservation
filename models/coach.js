/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Coach', {
    train_no: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Train',
        key: 'train_no'
      }
    },
    coach_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    coach_class: {
      type: DataTypes.STRING,
      allowNull: true
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    timestamps: false,
    tableName: 'coach'
  });
};
