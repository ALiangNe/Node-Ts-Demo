import { Model, DataTypes } from 'sequelize';
import { Sequelize } from 'sequelize';

export default function (sequelize: Sequelize) {
  class User extends Model {
    declare id: number;
    declare username: string;
    declare password: string;
    declare email: string;
    declare createdAt: Date;
    declare updatedAt: Date;
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User'
  });

  return User;
}