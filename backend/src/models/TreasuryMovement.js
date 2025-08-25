// Treasury Movements Model
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TreasuryMovement = sequelize.define('TreasuryMovement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2)
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2)
  },
  debt_tracking: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'treasury_movements',
  timestamps: false
});

module.exports = TreasuryMovement;