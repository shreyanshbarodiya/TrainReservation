/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Passenger', {
    pnr: {
      type: 'NUMERIC',
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Ticket',
        key: 'pnr'
      }
    },
    p_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: false,
    tableName: 'passenger'
  });
};
