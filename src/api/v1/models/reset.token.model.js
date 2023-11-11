'use strict'

const { Model, DataTypes } = require('sequelize')
const { mysql } = require('~/databases')

class ResetToken extends Model {}

ResetToken.init({
  resetToken: {
    type: DataTypes.STRING,
    primaryKey: true
  }
}, {
  sequelize: mysql.getInstance(),
  modelName: 'ResetToken',
  tableName: 'ResetToken'
})

module.exports = ResetToken