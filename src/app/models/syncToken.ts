import mongoose, { Schema, model } from "mongoose";

const syncTokenSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "globalSyncToken" },
    syncToken: { type: String, required: true },
  },
  { timestamps: true }
);

const SyncToken =
  mongoose.models.SyncToken || model("SyncToken", syncTokenSchema);

export default SyncToken;
