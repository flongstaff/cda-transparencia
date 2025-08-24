// Investments and Assets Model
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InvestmentAsset = sequelize.define('InvestmentAsset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  asset_type: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  value: {
    type: DataTypes.DECIMAL(15, 2)
  },
  depreciation: {
    type: DataTypes.DECIMAL(15, 2)
  },
  location: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'investments_assets',
  timestamps: false
});

module.exports = InvestmentAsset;