import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import Room from './Room';
import bcrypt from 'bcryptjs';

class Student extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public phone!: string;
  public roomId!: number | null;
  public bookingStatus!: 'None' | 'Pending' | 'Approved' | 'Rejected';
  public profilePhoto!: string | null;
  public theme!: 'dark' | 'light';
  public role!: 'student' | 'admin';

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Student.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  roomId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    references: {
      model: 'rooms',
      key: 'id',
    }
  },
  bookingStatus: {
    type: DataTypes.ENUM('None', 'Pending', 'Approved', 'Rejected'),
    defaultValue: 'None',
  },
  profilePhoto: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  theme: {
    type: DataTypes.STRING(10),
    defaultValue: 'dark',
  },
  role: {
    type: DataTypes.ENUM('student', 'admin'),
    defaultValue: 'student',
  }
}, {
  sequelize,
  tableName: 'students',
  hooks: {
    beforeSave: async (student: Student) => {
      if (student.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(student.password, salt);
      }
    }
  }
});

export default Student;
