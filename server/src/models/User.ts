import { Schema, model } from "mongoose";

export type UserRole = "CUSTOMER" | "SUPPORT_AGENT" | "ADMIN";

export interface UserAttributes {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  sessionVersion: number;
  resetTokenHash?: string;
  resetTokenExpiresAt?: Date;
}

const userSchema = new Schema<UserAttributes>({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  phone: { type: String, trim: true, maxlength: 30 },
  role: { type: String, enum: ["CUSTOMER", "SUPPORT_AGENT", "ADMIN"], required: true, default: "CUSTOMER" },
  isActive: { type: Boolean, default: true, required: true },
  sessionVersion: { type: Number, default: 0, required: true },
  resetTokenHash: { type: String, select: false },
  resetTokenExpiresAt: { type: Date, select: false },
}, {
  timestamps: true,
});

export const User = model<UserAttributes>("User", userSchema);