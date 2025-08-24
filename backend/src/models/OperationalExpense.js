// Operational Expenses Model
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OperationalExpense = sequelize.define('OperationalExpense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2)
  },
  administrative_analysis: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'operational_expenses',
  timestamps: false
});

module.exports = OperationalExpense;