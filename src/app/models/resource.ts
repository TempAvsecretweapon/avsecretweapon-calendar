import { Schema, model, models } from "mongoose";

const ResourceSchema = new Schema(
  {
    name: { type: String, required: true },
    availability: {
      start: { type: String, required: true }, // Example: "07:30"
      end: { type: String, required: true },   // Example: "18:00"
    },
  },
  {
    timestamps: true,
  }
);

const Resource = models.Resource || model("Resource", ResourceSchema);

export default Resource;
