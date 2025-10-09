/** */
* User Model
 * 
 * Defines the schema for healthcare system users
 * 
 * Security Features:
 * - Indexes for performance
 * - Validation for email format
 * - Sensitive data exclusion in responses
 */
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please use a valid email address']
    },
    name: {
      type: String,
      default: ""
    },
    profilePicture: {
      type: String,
      default: ""
    },
    roles: {
      type: [String],
      enum: ['patient', 'provider', 'admin'],
      default: ['patient']
    },
    lastLogin: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// indexes
userSchema.index({ email: 1 });
userSchema.index({ roles: 1 });

const User = mongoose.model('User', userSchema);
export default User;