/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Transaction', {
    txn_id: {
      type: 'NUMERIC',
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'User',
        key: 'username'
      }
    },
    debit: {
      type: 'NUMERIC',
      allowNull: true
    },
    credit: {
      type: 'NUMERIC',
      allowNull: true
    }
  }, {
    timestamps: false,
    tableName: 'transaction'
  });
};
