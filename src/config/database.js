//sequelize
const {Sequelize, DataTypes} = require('sequelize');
require('dotenv').config();
const sequelize = new Sequelize(process.env.DATABASE_URL);

const User = sequelize.define(
    'user',
    {
        userId: {
            field: 'user_id',
            primaryKey: true,
            type: DataTypes.NUMBER,
            autoIncrement: true,
            allowNull: true
        },
        email: {
            field: 'email',
            type: DataTypes.STRING,
            allowNull: false
        },
        pwd: {
            field: 'pwd',
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            field: 'name',
            type: DataTypes.STRING,
            allowNull: false
        },
        cityId: {
            field: 'city_id',
            type: DataTypes.NUMBER,
            allowNull: false
        },
        groupId: {
            field: 'group_id',
            type: DataTypes.NUMBER,
            allowNull: false
        }
    }
)

module.exports = {
    User
}