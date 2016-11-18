/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Ticket', {
        pnr: {
            type: 'NUMERIC',
            allowNull: false,
            primaryKey: true
        },
        date_of_journey: {
            type: DataTypes.DATE,
            allowNull: true
        },
        date_of_boarding: {
            type: DataTypes.DATE,
            allowNull: true
        },
        boarding_pt: {
            type: DataTypes.STRING,
            allowNull: true,
            references: {
                model: 'Station',
                key: 'station_id'
            }
        },
        destination: {
            type: DataTypes.STRING,
            allowNull: true,
            references: {
                model: 'Station',
                key: 'station_id'
            }
        },
        train_no: {
            type: DataTypes.STRING,
            allowNull: true,
            references: {
                model: 'Train',
                key: 'train_no'
            }
        },
        username: {
            type: DataTypes.STRING,
            allowNull: true,
            references: {
                model: 'User',
                key: 'username'
            }
        },
        txn_id: {
            type: 'NUMERIC',
            allowNull: true,
            references: {
                model: 'Transaction',
                key: 'txn_id'
            }
        }
    }, {
        timestamps: false,
        tableName: 'ticket'
    });
};
