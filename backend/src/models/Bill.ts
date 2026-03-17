import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

class Bill extends Model {
  public id!: number;
  public studentId!: number;
  public amount!: number;
  public month!: string;
  public status!: 'Paid' | 'Unpaid';
  public dueDate!: Date;
  public paidDate!: Date | null;
  public readonly createdAt!: Date;
}

Bill.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id',
    }
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  month: {
    type: DataTypes.STRING(20), // "January 2024"
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Paid', 'Unpaid'),
    defaultValue: 'Unpaid',
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  paidDate: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  sequelize,
  tableName: 'bills',
});

export default Bill;
