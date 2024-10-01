const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db/app.db'
});

const Data = sequelize.define('Data', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
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
