import mongoose, { Document, Model, Schema } from "mongoose";

export interface IInterest extends Document {
  senderUserId: mongoose.Types.ObjectId;
  senderProfileId: mongoose.Types.ObjectId;
  receiverUserId: mongoose.Types.ObjectId;
  receiverProfileId: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "declined" | "withdrawn";
  createdAt: Date;
  updatedAt: Date;
}

const InterestSchema = new Schema<IInterest>(
  {
    senderUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderProfileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },
    receiverUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverProfileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "withdrawn"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index so a sender cannot send duplicate pending interests to the same receiver
InterestSchema.index({ senderProfileId: 1, receiverProfileId: 1 });
InterestSchema.index({ receiverUserId: 1, status: 1 });

export const Interest: Model<IInterest> =
  mongoose.models.Interest ||
  mongoose.model<IInterest>("Interest", InterestSchema);

