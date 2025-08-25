// Public Tenders Model
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PublicTender = sequelize.define('PublicTender', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  budget: {
    type: DataTypes.DECIMAL(12, 2)
  },
  awarded_to: {
    type: DataTypes.STRING
  },
  award_date: {
    type: DataTypes.DATE
  },
  execution_status: {
    type: DataTypes.STRING
  },
  delay_analysis: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'public_tenders',
  timestamps: false
});

module.exports = PublicTender;