/**
 * User Model for Healthcare Appointment Booking System
 * 
 * @file src/models/userModel.js
 * @description Defines the schema for healthcare system users with comprehensive user management
 * 
 * Features:
 * - Firebase UID integration for authentication
 * - Role-based access control
 * - Profile management with validation
 * - Timestamp tracking for user activity
 * - Security-focused data handling
 * 
 * Security Features:
 * - Indexes for performance optimization
 * - Email format validation
 * - Sensitive data exclusion in API responses
 * - Role enumeration for controlled access
 * 
 * @version 2.0.0
 * @module User
 */
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: [true, 'Firebase UID is required'],
      unique: true,
      index: true,
      immutable: true // Cannot be changed after creation
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
      index: true
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxLength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxLength: [50, 'Last name cannot exceed 50 characters']
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Please provide a valid phone number']
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function(dob) {
          return dob <= new Date();
        },
        message: 'Date of birth cannot be in the future'
      }
    },
    profilePicture: {
      type: String,
      default: "",
      validate: {
        validator: function(url) {
          if (!url) return true; // Empty is allowed
          try {
            new URL(url);
            return true;
          } catch (e) {
            return false;
          }
        },
        message: 'Profile picture must be a valid URL'
      }
    },
    roles: {
      type: [String],
      enum: {
        values: ['patient', 'provider', 'admin'],
        message: 'Role must be one of: patient, provider, admin'
      },
      default: ['patient'],
      validate: {
        validator: function(roles) {
          return roles.length > 0;
        },
        message: 'User must have at least one role'
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true }
      },
      language: {
        type: String,
        default: 'en',
        enum: ['en', 'es', 'fr'] // Add more languages as needed
      },
      timezone: {
        type: String,
        default: 'UTC'
      }
    },
    medicalProfile: {
      bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', null],
        default: null
      },
      allergies: [{
        name: String,
        severity: {
          type: String,
          enum: ['mild', 'moderate', 'severe']
        }
      }],
      conditions: [{
        name: String,
        diagnosedDate: Date
      }],
      medications: [{
        name: String,
        dosage: String,
        frequency: String
      }]
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        // Remove sensitive/internal fields from API responses
        delete ret._id;
        delete ret.__v;
        delete ret.medicalProfile; // Consider if this should be exposed
        return ret;
      }
    },
    toObject: {
      virtuals: true
    }
  }
);

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Index for common queries
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ roles: 1, isActive: 1 });
userSchema.index({ lastName: 1, firstName: 1 });

// Pre-save middleware to update timestamps
userSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ roles: role, isActive: true });
};

// Instance method to check if user has a specific role
userSchema.methods.hasRole = function(role) {
  return this.roles.includes(role);
};

// Instance method to deactivate user
userSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Instance method to add a role
userSchema.methods.addRole = function(role) {
  if (!this.roles.includes(role) && userSchema.path('roles').enumValues.includes(role)) {
    this.roles.push(role);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to remove a role (but ensure at least one role remains)
userSchema.methods.removeRole = function(role) {
  if (this.roles.length > 1 && this.roles.includes(role)) {
    this.roles = this.roles.filter(r => r !== role);
    return this.save();
  }
  return Promise.resolve(this);
};

const User = mongoose.model('User', userSchema);

export default User;