const { Sequelize, DataTypes } = require('sequelize');
/* mySql deployment

const sequelize = new Sequelize({
    dialect: 'mysql',
    host: 'localhost',
    username: 'your_username',
    password: 'your_password',
    database: 'your_database'
});

*/

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db/app.db'
});

const Data = sequelize.define('Data', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'data',
    timestamps: false
});

// Sync the model with the database
sequelize.sync();

module.exports = Data;
