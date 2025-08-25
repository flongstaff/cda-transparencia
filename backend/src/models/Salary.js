// Salaries Model
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Salary = sequelize.define('Salary', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  official_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING
  },
  basic_salary: {
    type: DataTypes.DECIMAL(12, 2)
  },
  adjustments: {
    type: DataTypes.TEXT
  },
  deductions: {
    type: DataTypes.TEXT
  },
  net_salary: {
    type: DataTypes.DECIMAL(12, 2)
  },
  inflation_rate: {
    type: DataTypes.DECIMAL(5, 2)
  }
}, {
  tableName: 'salaries',
  timestamps: false
});

module.exports = Salary;