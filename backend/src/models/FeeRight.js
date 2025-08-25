// Fees and Rights Model
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FeeRight = sequelize.define('FeeRight', {
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
  revenue: {
    type: DataTypes.DECIMAL(15, 2)
  },
  collection_efficiency: {
    type: DataTypes.DECIMAL(5, 2)
  }
}, {
  tableName: 'fees_rights',
  timestamps: false
});

module.exports = FeeRight;