import mongoose, { Document, Schema } from "mongoose";

// Enum for Task Status
export enum Status {
  TODO = "TODO",
  PROGRESS = "PROGRESS",
  COMPLETED = "COMPLETED",
}

// Define Task Interface
export interface ITask extends Document {
  _id: string;
  title: string;
  description?: string;
  dueDate: Date;
  status: Status;
  isCompleted: boolean;
  user: mongoose.Types.ObjectId;
}

// Define Schema
const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.PROGRESS,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Reference to User
  },
  { timestamps: true }
);

const Task = mongoose.model<ITask>("Task", TaskSchema);
export default Task;
