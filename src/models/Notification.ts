import mongoose, { Document, Model, Schema } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  senderId?: mongoose.Types.ObjectId;
  senderProfileId?: mongoose.Types.ObjectId;
  title: string;
  text: string;
  link?: string;
  kind: "interest" | "accepted" | "declined" | "message" | "system";
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    senderProfileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
    },
    title: {
      type: String,
      default: "Connection Request",
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: "/interests/received",
    },
    kind: {
      type: String,
      enum: ["interest", "accepted", "declined", "message", "system"],
      default: "interest",
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

