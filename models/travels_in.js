/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Travels_in', {
    pnr: {
      type: 'NUMERIC',
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Passenger',
        key: 'pnr'
      }
    },
    p_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Passenger',
        key: 'p_id'
      }
    },
    train_no: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Coach',
        key: 'train_no'
      }
    },
    coach_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Coach',
        key: 'coach'
      }
    },
    seat_no: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true
    },
    waitlist_no: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    preference: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: false,
    tableName: 'travels_in'
  });
};
