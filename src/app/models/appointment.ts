import { Schema, model, models } from "mongoose";

const AppointmentSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: String, required: true }, // Example: "2024-11-20"
    startTime: { type: String, required: true }, // Example: "07:30"
    endTime: { type: String, required: true }, // Example: "09:30"
    duration: { type: Number, required: true }, // Duration in hours, Example: 2
    description: { type: String },
    resource: { type: String, required: true }, // Example: "Level 1 Team"
    status: {
      type: String,
      enum: ["confirmed", "canceled", "rescheduled"],
      required: true,
    }, // Status options
    googleEventId: { type: String }, // Google Event ID, optional
    attendees: [
      {
        type: Schema.Types.ObjectId,
        ref: "Technician",
      },
    ],
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);

const Appointment =
  models.Appointment || model("Appointment", AppointmentSchema);

export default Appointment;
