import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import Student from './Student';

class Room extends Model {
  public id!: number;
  public roomNumber!: string;
  public type!: 'Single' | 'Double' | 'Triple';
  public floor!: number;
  public price!: number;
  public isAvailable!: boolean;
  public amenities!: string; // Stored as JSON string or comma-separated
  public capacity!: number;
  public description!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Room.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  roomNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.ENUM('Single', 'Double', 'Triple'),
    allowNull: false,
  },
  floor: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  amenities: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('amenities');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value: string[]) {
      this.setDataValue('amenities', JSON.stringify(value));
    }
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  }
}, {
  sequelize,
  tableName: 'rooms',
});

export default Room;
