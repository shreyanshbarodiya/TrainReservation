/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Station', {
    station_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: false,
    tableName: 'station'
  });
};
