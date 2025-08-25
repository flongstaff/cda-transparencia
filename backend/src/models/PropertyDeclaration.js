// Property Declarations Model
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PropertyDeclaration = sequelize.define('PropertyDeclaration', {
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
  cuil: {
    type: DataTypes.STRING
  },
  declaration_date: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.STRING
  },
  uuid: {
    type: DataTypes.STRING
  },
  observations: {
    type: DataTypes.TEXT
  },
  public_verification: {
    type: DataTypes.TEXT
  },
  critical_review: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'property_declarations',
  timestamps: false
});

module.exports = PropertyDeclaration;