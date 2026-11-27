import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  mobile: string;
  password?: string;
  gender: "female" | "male";
  dob?: string;
  createdBy: "Self" | "Parent" | "Sibling" | "Relative";
  role: "member" | "admin";
  status: "active" | "suspended";
  isVerified: boolean;
  isOnline?: boolean;
  lastSeen?: Date;
  membership: {
    tier: "free" | "gold" | "premium";
    validUntil?: string;
  };
  profileId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    mobile: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ["female", "male"], required: true },
    dob: { type: String, default: "" },
    createdBy: {
      type: String,
      enum: ["Self", "Parent", "Sibling", "Relative"],
      default: "Self",
    },
    role: { type: String, enum: ["member", "admin"], default: "member" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    isVerified: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    membership: {
      tier: { type: String, enum: ["free", "gold", "premium"], default: "free" },
      validUntil: { type: String },
    },
    profileId: { type: Schema.Types.ObjectId, ref: "Profile" },
  },
  {
    timestamps: true,
  },
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
