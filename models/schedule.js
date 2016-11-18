module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Schedule', {
    train_no: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Train',
        key: 'train_no'
      }
    },
    station_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Station',
        key: 'station_id'
      }
    },
    arrival_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    departure_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    station_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    days: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    distance: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    timestamps: false,
    tableName: 'schedule'
  });
};
