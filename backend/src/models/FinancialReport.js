// Financial Reports Model
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FinancialReport = sequelize.define('FinancialReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quarter: {
    type: DataTypes.INTEGER
  },
  report_type: {
    type: DataTypes.STRING
  },
  income: {
    type: DataTypes.DECIMAL(15, 2)
  },
  expenses: {
    type: DataTypes.DECIMAL(15, 2)
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2)
  },
  execution_percentage: {
    type: DataTypes.DECIMAL(5, 2)
  }
}, {
  tableName: 'financial_reports',
  timestamps: false
});

module.exports = FinancialReport;