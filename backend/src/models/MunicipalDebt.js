// Municipal Debt Model
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MunicipalDebt = sequelize.define('MunicipalDebt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  debt_type: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2)
  },
  interest_rate: {
    type: DataTypes.DECIMAL(5, 2)
  },
  due_date: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'municipal_debt',
  timestamps: false
});

module.exports = MunicipalDebt;