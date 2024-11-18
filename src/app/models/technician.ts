import { Schema, model, models } from "mongoose";

const TechnicianSchema = new Schema(
  {
    name: { type: String, required: true },
    level: { type: Number, required: true }, // Example: 1
    email: { type: String, required: true },
    availability: {
      start: { type: String, required: true }, // Example: "07:30"
      end: { type: String, required: true }, // Example: "18:00"
    },
    calendarId: { type: String, required: true }, // Google Calendar ID
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);

const Technician = models.Technician || model("Technician", TechnicianSchema);

export default Technician;
