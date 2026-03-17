import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

class FoodMenu extends Model {
  public id!: number;
  public day!: string;
  public morning!: string;
  public afternoon!: string;
  public night!: string;
}

FoodMenu.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  day: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  morning: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  afternoon: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  night: {
    type: DataTypes.TEXT,
    allowNull: false,
  }
}, {
  sequelize,
  tableName: 'food_menus',
  timestamps: false,
});

export default FoodMenu;
