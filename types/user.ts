import { Subscription } from "./membership";

export interface User {
  id: string;
  email: string;
  displayName: string;
  // Personal Information
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  // Profile
  photoURL?: string;
  bio?: string;
  // Membership & Access Control
  role: UserRole;
  isActive: boolean;
  // WooCommerce Migration
  wooCommerceUserId?: string;
  // Timestamps
  createdAt: number;
  updatedAt: number;
  lastLoginAt?: number;
}

export interface UserProfile extends User {
  // Extend with active subscriptions
  activeSubscriptions: Subscription[];
}

export type UserRole = 'user' | 'admin' | 'moderator';

// For creating new users
export type CreateUserInput = Omit<User, 'id' | 'role' | 'isActive' | 'createdAt' | 'updatedAt'> & {
  password: string;
};

// For updating existing users
export type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;

// For user authentication
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

// Extended profile with membership status
export interface UserMembershipStatus {
  hasMembership: boolean;
  activeMemberships: string[]; // Array of active membership IDs
  activeSubscriptions: Subscription[];
}
