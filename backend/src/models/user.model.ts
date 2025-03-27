import mongoose, { Document, Schema } from "mongoose";
import { ITask } from "./task.model"; // Import Task interface

// Define User Interface
export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  tasks: mongoose.Types.ObjectId[] | ITask[];
  refreshToken?: string;
}

// Define Schema
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ], // Reference to Task
    refreshToken: {
      type: String,
      default: null,
    }, // Nullable refresh token
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
