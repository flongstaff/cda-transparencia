import { Schema, model } from 'mongoose';

// Define User interface
interface IUser {
  _id: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

// Define User schema
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Add method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  // In a real implementation, this would use bcrypt or similar
  return new Promise((resolve) => {
    // Simple comparison for demonstration - in production use proper password hashing
    resolve(candidatePassword === this.password);
  });
};

// Create and export User model
const User = model<IUser>('User', userSchema);

export { IUser, User };
