import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  gender: "female" | "male";
  dob: string;
  heightCm: number;
  maritalStatus: string;
  religion: string;
  community: string;
  motherTongue: string;
  city: string;
  qualification: string;
  college?: string;
  occupation: string;
  company?: string;
  income: string;
  familyType: string;
  familyValues: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  siblings?: string;
  diet: string;
  smoking: string;
  drinking: string;
  hobbies: string[];
  about: string;
  prefs: {
    ageMin: number;
    ageMax: number;
    heightMin: number;
    heightMax: number;
    religions: string[];
    locations: string[];
    education: string;
    occupation: string;
    maritalStatus: string[];
  };
  tone: number;
  status: "pending" | "approved" | "rejected";
  verified: boolean;
  createdBy: "Self" | "Parent" | "Sibling" | "Relative";
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["female", "male"], required: true },
    dob: { type: String, required: true },
    heightCm: { type: Number, default: 165 },
    maritalStatus: { type: String, default: "Never Married" },
    religion: { type: String, default: "Hindu" },
    community: { type: String, default: "" },
    motherTongue: { type: String, default: "Hindi" },
    city: { type: String, default: "Mumbai" },
    qualification: { type: String, default: "B.Tech" },
    college: { type: String, default: "" },
    occupation: { type: String, default: "Software Professional" },
    company: { type: String, default: "" },
    income: { type: String, default: "15-20 Lakhs" },
    familyType: { type: String, default: "Nuclear" },
    familyValues: { type: String, default: "Moderate" },
    fatherOccupation: { type: String, default: "" },
    motherOccupation: { type: String, default: "" },
    siblings: { type: String, default: "" },
    diet: { type: String, default: "Vegetarian" },
    smoking: { type: String, default: "No" },
    drinking: { type: String, default: "No" },
    hobbies: { type: [String], default: [] },
    about: { type: String, default: "" },
    prefs: {
      ageMin: { type: Number, default: 21 },
      ageMax: { type: Number, default: 35 },
      heightMin: { type: Number, default: 150 },
      heightMax: { type: Number, default: 190 },
      religions: { type: [String], default: [] },
      locations: { type: [String], default: [] },
      education: { type: String, default: "" },
      occupation: { type: String, default: "" },
      maritalStatus: { type: [String], default: ["Never Married"] },
    },
    tone: { type: Number, default: 1 },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
    verified: { type: Boolean, default: true },
    createdBy: {
      type: String,
      enum: ["Self", "Parent", "Sibling", "Relative"],
      default: "Self",
    },
  },
  {
    timestamps: true,
  },
);

export const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema);
