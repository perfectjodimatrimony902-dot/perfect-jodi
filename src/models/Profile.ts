import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  gender: "female" | "male";
  dob: string;
  photoUrl?: string;
  photos?: string[];
  heightCm: number;
  weightKg?: number;
  maritalStatus: string;
  religion: string;
  community: string;
  subCaste?: string;
  gotra?: string;
  manglik?: string;
  birthTime?: string;
  birthPlace?: string;
  rashi?: string;
  nakshatra?: string;
  motherTongue: string;
  languages?: string[];
  disability?: string;
  country?: string;
  state?: string;
  city: string;
  nativePlace?: string;
  willingToRelocate?: string;
  qualification: string;
  educationLevel?: string;
  educationField?: string;
  college?: string;
  employmentType?: string;
  occupation: string;
  designation?: string;
  company?: string;
  income: string;
  familyType: string;
  familyStatus?: string;
  familyValues: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  brothersCount?: number;
  sistersCount?: number;
  siblings?: string;
  aboutFamily?: string;
  diet: string;
  smoking: string;
  drinking: string;
  hobbies: string[];
  about: string;
  marriageTimeline?: string;
  livingArrangement?: string;
  childrenPreference?: string;
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
  createdBy:
    | "Self"
    | "Father"
    | "Mother"
    | "Brother"
    | "Sister"
    | "Parent"
    | "Sibling"
    | "Relative"
    | "Guardian";
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["female", "male"], required: true },
    dob: { type: String, required: true },
    photoUrl: { type: String, default: "" },
    photos: { type: [String], default: [] },
    heightCm: { type: Number, default: 165 },
    weightKg: { type: Number, default: null },
    maritalStatus: { type: String, default: "Never Married" },
    religion: { type: String, default: "Hindu" },
    community: { type: String, default: "" },
    subCaste: { type: String, default: "" },
    gotra: { type: String, default: "" },
    manglik: { type: String, default: "" },
    birthTime: { type: String, default: "" },
    birthPlace: { type: String, default: "" },
    rashi: { type: String, default: "" },
    nakshatra: { type: String, default: "" },
    motherTongue: { type: String, default: "Hindi" },
    languages: { type: [String], default: [] },
    disability: { type: String, default: "None" },
    country: { type: String, default: "India" },
    state: { type: String, default: "" },
    city: { type: String, default: "Mumbai" },
    nativePlace: { type: String, default: "" },
    willingToRelocate: { type: String, default: "" },
    qualification: { type: String, default: "B.Tech" },
    educationLevel: { type: String, default: "" },
    educationField: { type: String, default: "" },
    college: { type: String, default: "" },
    employmentType: { type: String, default: "" },
    occupation: { type: String, default: "Software Professional" },
    designation: { type: String, default: "" },
    company: { type: String, default: "" },
    income: { type: String, default: "15-20 Lakhs" },
    familyType: { type: String, default: "Nuclear" },
    familyStatus: { type: String, default: "" },
    familyValues: { type: String, default: "Moderate" },
    fatherOccupation: { type: String, default: "" },
    motherOccupation: { type: String, default: "" },
    brothersCount: { type: Number, default: 0 },
    sistersCount: { type: Number, default: 0 },
    siblings: { type: String, default: "" },
    aboutFamily: { type: String, default: "" },
    diet: { type: String, default: "Vegetarian" },
    smoking: { type: String, default: "No" },
    drinking: { type: String, default: "No" },
    hobbies: { type: [String], default: [] },
    about: { type: String, default: "" },
    marriageTimeline: { type: String, default: "" },
    livingArrangement: { type: String, default: "" },
    childrenPreference: { type: String, default: "" },
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
      enum: [
        "Self",
        "Father",
        "Mother",
        "Brother",
        "Sister",
        "Parent",
        "Sibling",
        "Relative",
        "Guardian",
      ],
      default: "Self",
    },
  },
  {
    timestamps: true,
  },
);

export const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema);
