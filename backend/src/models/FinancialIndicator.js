// Financial Indicators Model
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FinancialIndicator = sequelize.define('FinancialIndicator', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  indicator_name: {
    type: DataTypes.STRING
  },
  value: {
    type: DataTypes.DECIMAL(15, 2)
  },
  description: {
    type: DataTypes.TEXT
  },
  comparison_previous_year: {
    type: DataTypes.DECIMAL(5, 2)
  }
}, {
  tableName: 'financial_indicators',
  timestamps: false
});

module.exports = FinancialIndicator;